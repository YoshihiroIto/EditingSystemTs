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

export class NotifyCollectionChangedEventArgs extends EventArgs {
  constructor(
    public readonly action: NotifyCollectionChangedAction,
    public readonly newItems: any[],
    public readonly oldItems: any[],
    public readonly startingIndex: number
  ) {
    super();

    throw new Error('Not implement');
  }
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
