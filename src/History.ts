import { NotifyPropertyChanged, PropertyChangedEventArgs, NotifyCollectionChangedActions } from './Event';
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
    if (this.canUndo == false) {
      return;
    }

    const action = this.undoStack.pop();
    if (action == null) {
      throw new Error();
    }

    try {
      this.isInUndoing = true;
      action.Undo();
    } finally {
      this.isInUndoing = false;
    }

    this.redoStack.push(action);
  }

  redo(): void {
    if (this.canRedo == false) {
      return;
    }

    const action = this.redoStack.pop();
    if (action == null) {
      throw new Error();
    }

    try {
      this.isInUndoing = true;
      action.Redo();
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
    if (this.batchDepth == 0) throw new Error('Batch recording has not begun.');

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
        () => thisBatchHistory.UndoAll(),
        () => thisBatchHistory.RedoAll()
      );
    }

    this.batchHistory = null;
  }

  push(undo: UndoFunction, redo: RedoFunction): void {
    if (this.isInBatch) {
      if (this.batchHistory == null) {
        throw new Error();
      }

      this.batchHistory.push(undo, redo);
      return;
    }

    this.undoStack.push(new HistoryAction(undo, redo));
  }

  clear(): void {
    this.undoStack.splice(0, this.undoStack.length);
    this.redoStack.splice(0, this.redoStack.length);
  }

  register(model: NotifyPropertyChanged): void {
    const propertyNames = Object.getOwnPropertyNames(model);

    for (const propertyName of propertyNames) {
      const desc = Object.getOwnPropertyDescriptor(model, propertyName);
      if (desc == null) {
        continue;
      }

      // 管理外プロパティをはじく
      if (propertyName === 'PropertyChanged') {
        continue;
      }

      if (desc.value != null) {
        if (desc.value instanceof ObservableCollection /* NotifyCollectionChanged */) {
          this.setupObservableCollection(desc.value as ObservableCollection<unknown>);
        }
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
              packingDesc.value = oldValue;
              this.raisePropertyChanged(model, propertyName);
            },
            () => {
              packingDesc.value = value;
              this.raisePropertyChanged(model, propertyName);
            }
          );

          packingDesc.value = value;
          this.raisePropertyChanged(model, propertyName);
        },
      });
    }
  }

  private raisePropertyChanged(model: NotifyPropertyChanged, propertyName: string) {
    model.PropertyChanged.emit(this, new PropertyChangedEventArgs(propertyName));
  }

  private setupObservableCollection(target: ObservableCollection<unknown>) {
    target.CollectionChanged.on((sender, e) => {
      if (this.isInUndoing) {
        return;
      }

      if (sender instanceof ObservableCollection) {
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

          case NotifyCollectionChangedActions.BeginBatch:
            {
              this.beginBatch();
            }
            break;

          case NotifyCollectionChangedActions.EndBatch:
            {
              this.endBatch();
            }
            break;

          default:
            throw new Error(`Not implement: ${e.action}`);
        }
      } else {
        throw new Error();
      }
    });
  }
}

class HistoryAction {
  public readonly Undo: UndoFunction;
  public readonly Redo: RedoFunction;

  constructor(undo: UndoFunction, redo: RedoFunction) {
    this.Undo = undo;
    this.Redo = redo;
  }
}

interface UndoFunction extends Function {
  (): void;
}

interface RedoFunction extends Function {
  (): void;
}

class BatchHistory extends History {
  constructor() {
    super();
  }

  UndoAll(): void {
    while (this.canUndo) {
      this.undo();
    }
  }

  RedoAll(): void {
    while (this.canRedo) {
      this.redo();
    }
  }
}
