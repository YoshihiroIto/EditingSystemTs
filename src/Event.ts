import { EventArgs, TypedEvent } from './TypedEvent';

export interface NotifyPropertyChanged {
  readonly PropertyChanged: TypedEvent<PropertyChangedEventArgs>;
}

export class PropertyChangedEventArgs extends EventArgs {
  constructor(public readonly propertyName: string) {
    super();
  }
}

export interface NotifyCollectionChanged {
  readonly CollectionChanged: TypedEvent<NotifyCollectionChangedEventArgs>;
}

export const NotifyCollectionChangedActions = {
  Unset: 'Unset',
  Add: 'Add',
  Move: 'Move',
  Remove: 'Remove',
  Replace: 'Replace',
  Reset: 'Reset',
  //
  BeginBatch: 'BeginBatch',
  EndBatch: 'EndBatch',
} as const;

export type NotifyCollectionChangedAction = typeof NotifyCollectionChangedActions[keyof typeof NotifyCollectionChangedActions];

export class NotifyCollectionChangedEventArgs extends EventArgs {
  public static readonly Empty: NotifyCollectionChangedEventArgs = new NotifyCollectionChangedEventArgs(
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

  public setOldItemsInternal(items: unknown[] | null): void {
    this._oldItems = items;
  }

  constructor(
    private _action: NotifyCollectionChangedAction,
    private _newItems: unknown[] | null,
    private _oldItems: unknown[] | null,
    private _newStartingIndex: number,
    private _oldStartingIndex: number
  ) {
    super();
  }
}
