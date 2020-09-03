import {
  NotifyCollectionChangedActions,
  NotifyCollectionChangedEventArgs,
  NotifyPropertyChanged,
  PropertyChangedEventArgs,
} from './Event';
import { ObservableArray } from './ObservableArray';
import { Assert } from './Assert';
import { EditingSystem } from './Decorators';

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

  private readonly undoStack = new Array<HistoryAction>();
  private readonly redoStack = new Array<HistoryAction>();

  private isInUndoing = false;

  undo(): void {
    if (this.isInBatch) {
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
    if (this.isInBatch) {
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
  public get isInBatch(): boolean {
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

  beginBatchInternal(): void {
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
    }
  }

  clear(): void {
    this.undoStack.splice(0, this.undoStack.length);
    this.redoStack.splice(0, this.redoStack.length);
  }

  register(target: NotifyPropertyChanged): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = target as any;
    const ignoreUndoProperties = t[EditingSystem.ignoreName] as Set<string>;
    if (ignoreUndoProperties != null) {
      delete t[EditingSystem.ignoreName];
    }

    const onCollectionChanged = (sender: unknown, e: NotifyCollectionChangedEventArgs) =>
      this.OnCollectionChanged(sender, e);

    const propertyNames = Object.getOwnPropertyNames(target);
    for (const propertyName of propertyNames) {
      // 管理外プロパティをはじく
      if (propertyName === 'propertyChanged') {
        continue;
      }

      // 無視プロパティをはじく
      if (ignoreUndoProperties != null) {
        if (ignoreUndoProperties.has(propertyName)) {
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

      if (desc.value instanceof ObservableArray) {
        desc.value.collectionChanged.on(onCollectionChanged);
      }

      // 保存領域を作る
      let packing = desc.value;
      let isInDoing = false;

      // 元のプロパティのセッター、ゲッターを作る
      Object.defineProperty(target, propertyName, {
        get: () => packing,
        set: value => {
          if (isInDoing) {
            return;
          }

          const oldValue = packing;

          const doProc = (v: unknown) => {
            try {
              isInDoing = true;

              if (packing instanceof ObservableArray) {
                packing.collectionChanged.off(onCollectionChanged);
              }

              const d = Object.getOwnPropertyDescriptor(target, propertyName);
              if (d?.set != null) {
                d.set(v);
              }

              packing = v;

              if (packing instanceof ObservableArray) {
                packing.collectionChanged.on(onCollectionChanged);
              }

              this.raisePropertyChanged(target, propertyName);
            } finally {
              isInDoing = false;
            }
          };

          this.push(
            () => doProc(oldValue),
            () => doProc(value)
          );

          doProc(value);
        },
      });
    }
  }

  private raisePropertyChanged(model: NotifyPropertyChanged, propertyName: string) {
    model.propertyChanged.emit(this, new PropertyChangedEventArgs(propertyName));
  }

  private OnCollectionChanged(sender: unknown, e: NotifyCollectionChangedEventArgs): void {
    if (this.isInUndoing) {
      return;
    }

    if (sender instanceof ObservableArray) {
      if (e.isBeginBatch) {
        this.beginBatch();
      }

      switch (e.action) {
        case NotifyCollectionChangedActions.Add:
          {
            const addItems = e.newItems;
            Assert.isNotNull(addItems);

            const undo = () => sender.splice(e.newStartingIndex, addItems.length);
            const redo = () => sender.splice(e.newStartingIndex, 0, ...addItems);

            this.push(undo, redo);
          }

          break;

        case NotifyCollectionChangedActions.Remove:
          {
            const oldItems = e.oldItems;
            Assert.isNotNull(oldItems);

            const undo = () => sender.splice(e.oldStartingIndex, 0, ...oldItems);
            const redo = () => sender.splice(e.oldStartingIndex, oldItems.length);

            this.push(undo, redo);
          }
          break;

        case NotifyCollectionChangedActions.Reset:
          {
            const doProc = () => {
              const oldItems = e.oldItems;
              Assert.isNotNull(oldItems);

              const old = ObservableArray.from(sender);
              sender.splice(0);
              sender.push(...oldItems);
              e.setOldItemsInternal(old);
            };
            this.push(doProc, doProc);
          }
          break;

        default:
          throw new Error(`Not implement: ${e.action}`);
      }

      if (e.isEndBatch) {
        this.endBatch();
      }
    } else {
      throw new Error();
    }
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
