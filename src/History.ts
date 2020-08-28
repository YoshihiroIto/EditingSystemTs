import {
  NotifyPropertyChanged,
  PropertyChangedEventArgs,
  NotifyCollectionChangedActions,
  NotifyCollectionChangedEventArgs,
} from './Event';
import { ObservableCollection } from './ObservableCollection';

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

    if (this.canUndo == false) {
      return;
    }

    const action = this.undoStack.pop();
    if (action == null) {
      throw new Error();
    }

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

    if (this.canRedo == false) {
      return;
    }

    const action = this.redoStack.pop();
    if (action == null) {
      throw new Error();
    }

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
  private get isInBatch(): boolean {
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
    if (this.batchHistory != null) {
      throw new Error();
    }

    this.batchHistory = new BatchHistory();
  }

  endBatchInternal(): void {
    if (this.batchHistory == null) {
      throw new Error();
    }

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
      if (this.batchHistory == null) {
        throw new Error();
      }

      this.batchHistory.push(undo, redo);
    } else {
      this.undoStack.push(new HistoryAction(undo, redo));
    }
  }

  clear(): void {
    this.undoStack.splice(0, this.undoStack.length);
    this.redoStack.splice(0, this.redoStack.length);
  }

  register(model: NotifyPropertyChanged): void {
    const propertyNames = Object.getOwnPropertyNames(model);

    const onCollectionChanged = (sender: unknown, e: NotifyCollectionChangedEventArgs) =>
      this.OnCollectionChanged(sender, e);

    for (const propertyName of propertyNames) {
      // 管理外プロパティをはじく
      if (propertyName === 'PropertyChanged') {
        continue;
      }

      const desc = Object.getOwnPropertyDescriptor(model, propertyName);
      if (desc == null) {
        continue;
      }

      if (desc.value instanceof ObservableCollection) {
        desc.value.CollectionChanged.on(onCollectionChanged);
      }

      // パッキングプロパティを作る
      const packingName = `_${propertyName}`;

      Object.defineProperty(model, packingName, {
        value: desc.value,
      });

      const packingDesc = Object.getOwnPropertyDescriptor(model, packingName);
      if (packingDesc == null) {
        continue;
      }

      // 元のプロパティのセッター、ゲッターを作る
      Object.defineProperty(model, propertyName, {
        get: () => packingDesc.value,
        set: value => {
          const oldValue = packingDesc.value;

          this.push(
            () => {
              if (packingDesc.value instanceof ObservableCollection) {
                packingDesc.value.CollectionChanged.off(onCollectionChanged);
              }

              packingDesc.value = oldValue;

              if (packingDesc.value instanceof ObservableCollection) {
                packingDesc.value.CollectionChanged.on(onCollectionChanged);
              }

              this.raisePropertyChanged(model, propertyName);
            },
            () => {
              if (packingDesc.value instanceof ObservableCollection) {
                packingDesc.value.CollectionChanged.off(onCollectionChanged);
              }

              packingDesc.value = value;

              if (packingDesc.value instanceof ObservableCollection) {
                packingDesc.value.CollectionChanged.on(onCollectionChanged);
              }

              this.raisePropertyChanged(model, propertyName);
            }
          );

          if (packingDesc.value instanceof ObservableCollection) {
            packingDesc.value.CollectionChanged.off(onCollectionChanged);
          }

          packingDesc.value = value;

          if (packingDesc.value instanceof ObservableCollection) {
            packingDesc.value.CollectionChanged.on(onCollectionChanged);
          }

          this.raisePropertyChanged(model, propertyName);
        },
      });
    }
  }

  private raisePropertyChanged(model: NotifyPropertyChanged, propertyName: string) {
    model.PropertyChanged.emit(this, new PropertyChangedEventArgs(propertyName));
  }

  private OnCollectionChanged(sender: unknown, e: NotifyCollectionChangedEventArgs): void {
    if (this.isInUndoing) {
      return;
    }

    if (sender instanceof ObservableCollection) {
      if (e.isBeginBatch) {
        this.beginBatch();
      }

      switch (e.action) {
        case NotifyCollectionChangedActions.Add:
          {
            const addItems = e.newItems;
            if (addItems == null) {
              throw new Error();
            }

            const undo = () => sender.splice(e.newStartingIndex, addItems.length);
            const redo = () => sender.splice(e.newStartingIndex, 0, ...addItems);

            this.push(undo, redo);
          }

          break;

        case NotifyCollectionChangedActions.Remove:
          {
            const oldItems = e.oldItems;
            if (oldItems == null) {
              throw new Error();
            }

            const undo = () => sender.splice(e.oldStartingIndex, 0, ...oldItems);
            const redo = () => sender.splice(e.oldStartingIndex, oldItems.length);

            this.push(undo, redo);
          }
          break;

        case NotifyCollectionChangedActions.Reset:
          {
            const redo = () => {
              const oldItems = e.oldItems;
              if (oldItems == null) {
                throw new Error();
              }

              const old = ObservableCollection.from(sender);
              sender.splice(0);
              sender.push(...oldItems);
              e.setOldItemsInternal(old);
            };
            const undo = redo;

            this.push(undo, redo);
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
  public readonly undo: UndoFunction;
  public readonly redo: RedoFunction;

  constructor(undo: UndoFunction, redo: RedoFunction) {
    this.undo = undo;
    this.redo = redo;
  }
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
