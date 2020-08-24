export class History {
  get CanUndo(): boolean {
    return this.undoStack.length > 0;
  }
  get CanRedo(): boolean {
    return this.redoStack.length > 0;
  }
  get CanClear(): boolean {
    return this.CanUndo || this.CanRedo;
  }

  private readonly undoStack = new Array<HistoryAction>();
  private readonly redoStack = new Array<HistoryAction>();

  Undo(): void {
    if (this.CanUndo == false) return;

    const action = this.undoStack.pop();
    if (action == null) throw new Error();

    action.Undo();

    this.redoStack.push(action);
  }

  Redo(): void {
    if (this.CanRedo == false) return;

    const action = this.redoStack.pop();
    if (action == null) throw new Error();

    action.Redo();

    this.undoStack.push(action);
  }

  Push(undo: UndoFunction, redo: RedoFunction): void {
    this.undoStack.push(new HistoryAction(undo, redo));
  }

  Clear(): void {
    this.undoStack.splice(0, this.undoStack.length);
    this.redoStack.splice(0, this.redoStack.length);
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
