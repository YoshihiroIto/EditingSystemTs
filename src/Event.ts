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
  Unset: 0,
  Add: 1,
  Move: 2,
  Remove: 3,
  Replace: 4,
  Reset: 5,
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

  constructor(
    public readonly action: NotifyCollectionChangedAction,
    public readonly newItems: unknown[] | null,
    public readonly oldItems: unknown[] | null,
    public readonly newStartingIndex: number,
    public readonly oldStartingIndex: number
  ) {
    super();
  }
}
