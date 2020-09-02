import { EventArgs, TypedEvent } from './TypedEvent';

export interface NotifyPropertyChanged {
  readonly propertyChanged: TypedEvent<PropertyChangedEventArgs>;
}

export class PropertyChangedEventArgs extends EventArgs {
  constructor(public readonly propertyName: string) {
    super();
  }
}

export const NotifyCollectionChangedActions = {
  Unset: 'Unset',
  Add: 'Add',
  Move: 'Move',
  Remove: 'Remove',
  Replace: 'Replace',
  Reset: 'Reset',
} as const;

export type NotifyCollectionChangedAction = typeof NotifyCollectionChangedActions[keyof typeof NotifyCollectionChangedActions];

export class NotifyCollectionChangedEventArgs extends EventArgs {
  public static readonly empty: NotifyCollectionChangedEventArgs = new NotifyCollectionChangedEventArgs(
    NotifyCollectionChangedActions.Unset,
    null,
    null,
    -1,
    -1
  );

  get action(): NotifyCollectionChangedAction {
    return this._action;
  }
  get newItems(): unknown[] | null {
    return this._newItems;
  }
  get oldItems(): unknown[] | null {
    return this._oldItems;
  }
  get newStartingIndex(): number {
    return this._newStartingIndex;
  }
  get oldStartingIndex(): number {
    return this._oldStartingIndex;
  }
  get isBeginBatch(): boolean {
    return this._isBeginBatch;
  }
  get isEndBatch(): boolean {
    return this._isEndBatch;
  }

  public setOldItemsInternal(items: unknown[] | null): void {
    this._oldItems = items;
  }

  private readonly _isBeginBatch;
  private readonly _isEndBatch;

  constructor(
    private _action: NotifyCollectionChangedAction,
    private _newItems: unknown[] | null,
    private _oldItems: unknown[] | null,
    private _newStartingIndex: number,
    private _oldStartingIndex: number,
    { isBeginBatch = false, isEndBatch = false }: { isBeginBatch?: boolean; isEndBatch?: boolean } = {}
  ) {
    super();

    this._isBeginBatch = isBeginBatch;
    this._isEndBatch = isEndBatch;
  }
}
