import {
  NotifyCollectionChangedActions,
  NotifyCollectionChangedEventArgs,
  NotifyPropertyChanged,
  PropertyChangedEventArgs,
} from './Event';
import { ObservableArray } from './ObservableArray';
import { Assert } from './Assert';
import { EditingSystem } from './Decorators';
import { EventArgs, TypedEvent } from './TypedEvent';

export class History {
  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }
  get canClear(): boolean {
    return this.canUndo || this.canRedo;
  }

  get undoRedoCount(): [undo: number, redo: number] {
    return [this.undoStack.length, this.redoStack.length];
  }

  readonly edited = new TypedEvent<EventArgs>();

  private readonly undoStack = new Array<HistoryAction>();
  private readonly redoStack = new Array<HistoryAction>();

  private isInUndoing = false;

  private get hasStack(): boolean {
    return this.undoStack.length > 0 || this.redoStack.length > 0;
  }

  undo(): void {
    if (this.isInBatch && this.batchHistory?.hasStack) {
      throw new Error("Can't call undo() during batch recording.");
    }

    if (this.isInPaused) {
      throw new Error("Can't call undo() during in paused.");
    }

    if (!this.canUndo) {
      return;
    }

    const action = this.undoStack.pop();
    Assert.isNotNull(action);

    try {
      this.isInUndoing = true;
      action.undo();
    } finally {
      this.isInUndoing = false;
    }

    this.redoStack.push(action);
  }

  redo(): void {
    if (this.isInBatch && this.batchHistory?.hasStack) {
      throw new Error("Can't call undo() during batch recording.");
    }

    if (this.isInPaused) {
      throw new Error("Can't call undo() during in paused.");
    }

    if (!this.canRedo) {
      return;
    }

    const action = this.redoStack.pop();
    Assert.isNotNull(action);

    try {
      this.isInUndoing = true;
      action.redo();
    } finally {
      this.isInUndoing = false;
    }

    this.undoStack.push(action);
  }

  private batchDepth = 0;
  private batchHistory: BatchHistory | null = null;
  get isInBatch(): boolean {
    return this.batchDepth > 0;
  }

  beginBatch(): void {
    ++this.batchDepth;

    if (this.batchDepth == 1) {
      this.beginBatchInternal();
    }
  }

  endBatch(): void {
    if (this.batchDepth == 0) {
      throw new Error('Batch recording has not begun.');
    }

    --this.batchDepth;

    if (this.batchDepth == 0) {
      this.endBatchInternal();
    }
  }

  private beginBatchInternal(): void {
    Assert.isNull(this.batchHistory);

    this.batchHistory = new BatchHistory();
  }

  endBatchInternal(): void {
    Assert.isNotNull(this.batchHistory);

    if (this.batchHistory.canUndo || this.batchHistory.canRedo) {
      const thisBatchHistory = this.batchHistory;

      this.push(
        () => thisBatchHistory.undoAll(),
        () => thisBatchHistory.redoAll()
      );
    }

    this.batchHistory = null;
  }

  private pauseDepth = 0;
  private get isInPaused(): boolean {
    return this.pauseDepth > 0;
  }

  beginPause(): void {
    ++this.pauseDepth;
  }

  endPause(): void {
    if (this.pauseDepth == 0) {
      throw new Error('Pause is not begun.');
    }

    --this.pauseDepth;
  }

  push(undo: UndoFunction, redo: RedoFunction): void {
    if (this.isInPaused) {
      return;
    }

    if (this.isInBatch) {
      Assert.isNotNull(this.batchHistory);

      this.batchHistory.push(undo, redo);
    } else {
      this.undoStack.push(new HistoryAction(undo, redo));
      this.redoStack.splice(0);
    }
  }

  clear(): void {
    this.undoStack.splice(0, this.undoStack.length);
    this.redoStack.splice(0, this.redoStack.length);
  }

  register(
    target: NotifyPropertyChanged,
    {
      arrowPropertyNames = null,
      ignorePropertyNames = null,
    }: {
      arrowPropertyNames?: Set<string> | null;
      ignorePropertyNames?: Set<string> | null;
    } = {}
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = target as any;
    const ignoreUndoProperties = t[EditingSystem.ignoreName] as Set<string>;
    if (ignoreUndoProperties != null) {
      delete t[EditingSystem.ignoreName];
    }

    const propertyNames = Object.getOwnPropertyNames(target);
    for (const propertyName of propertyNames) {
      // 管理外プロパティをはじく
      if (propertyName === 'propertyChanged') {
        continue;
      }

      if (arrowPropertyNames != null) {
        if (arrowPropertyNames.has(propertyName) == false) {
          continue;
        }
      }

      if (ignorePropertyNames != null) {
        if (ignorePropertyNames.has(propertyName)) {
          continue;
        }
      }

      const desc = Object.getOwnPropertyDescriptor(target, propertyName);
      if (desc == null) {
        continue;
      }

      if (desc.configurable === false) {
        continue;
      }

      const isIgnore = ignoreUndoProperties != null && ignoreUndoProperties.has(propertyName);

      if (desc.value instanceof ObservableArray) {
        desc.value.collectionChanged.on(this.onCollectionChanged);
      }

      // 保存領域を作る
      let packing = desc.value;

      // 元のプロパティのセッター、ゲッターを作る
      Object.defineProperty(target, propertyName, {
        get: () => packing,
        set: value => {
          if (isIgnore === false) {
            if (this.isInUndoing == false) {
              const oldValue = packing;

              this.push(
                () => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const anyTarget = target as any;
                  anyTarget[propertyName] = oldValue;
                },
                () => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const anyTarget = target as any;
                  anyTarget[propertyName] = value;
                }
              );
            }
          }

          if (packing instanceof ObservableArray) {
            packing.collectionChanged.off(this.onCollectionChanged);
          }

          const old = packing;

          packing = value;

          if (packing instanceof ObservableArray) {
            packing.collectionChanged.on(this.onCollectionChanged);
          }

          target.propertyChanged.emit(this, new PropertyChangedEventArgs(propertyName, old));
          this.invokeEdited();
        },
      });
    }
  }

  private onCollectionChanged = (sender: unknown, e: NotifyCollectionChangedEventArgs): void => {
    if (this.isInUndoing) {
      return;
    }

    const target = sender as ObservableArray<unknown>;

    if (e.isBeginBatch) {
      this.beginBatch();
    }

    switch (e.action) {
      case NotifyCollectionChangedActions.Add:
        {
          const addItems = e.newItems;
          Assert.isNotNull(addItems);

          const undo = () => {
            target.spliceCore(e.newStartingIndex, addItems.length);
            this.invokeEdited();
          };
          const redo = () => {
            target.spliceCore(e.newStartingIndex, 0, ...addItems);
            this.invokeEdited();
          };

          this.push(undo, redo);
          this.invokeEdited();
        }

        break;

      case NotifyCollectionChangedActions.Remove:
        {
          const oldItems = e.oldItems;
          Assert.isNotNull(oldItems);

          const undo = () => {
            target.spliceCore(e.oldStartingIndex, 0, ...oldItems);
            this.invokeEdited();
          };
          const redo = () => {
            target.spliceCore(e.oldStartingIndex, oldItems.length);
            this.invokeEdited();
          };

          this.push(undo, redo);
          this.invokeEdited();
        }
        break;

      case NotifyCollectionChangedActions.Reset:
        {
          const doProc = () => {
            const oldItems = e.oldItems;
            Assert.isNotNull(oldItems);

            const old = ObservableArray.from(target);
            target.spliceCore(0);
            target.pushCore(...oldItems);
            e.setOldItemsInternal(old);
            this.invokeEdited();
          };
          this.push(doProc, doProc);
          this.invokeEdited();
        }
        break;

      default:
        throw new Error(`Not implement: ${e.action}`);
    }

    if (e.isEndBatch) {
      this.endBatch();
    }
  };

  private invokeEdited(): void {
    this.edited.emit(this, EventArgs.empty);
  }
}

class HistoryAction {
  constructor(readonly undo: UndoFunction, readonly redo: RedoFunction) {}
}

interface UndoFunction extends Function {
  (): void;
}

interface RedoFunction extends Function {
  (): void;
}

class BatchHistory extends History {
  undoAll(): void {
    while (this.canUndo) {
      this.undo();
    }
  }

  redoAll(): void {
    while (this.canRedo) {
      this.redo();
    }
  }
}
