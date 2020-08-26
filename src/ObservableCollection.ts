import { TypedEvent } from './TypedEvent';
import { NotifyCollectionChanged, NotifyCollectionChangedEventArgs, NotifyCollectionChangedActions } from './Event';

export class ObservableCollection<T> extends Array<T> implements NotifyCollectionChanged {
  get CollectionChanged(): TypedEvent<NotifyCollectionChangedEventArgs> {
    if (this._CollectionChanged == null) {
      this._CollectionChanged = new TypedEvent<NotifyCollectionChangedEventArgs>();
    }

    return this._CollectionChanged;
  }

  private _CollectionChanged: TypedEvent<NotifyCollectionChangedEventArgs> | null = null;

  constructor() {
    super();
  }

  push(...items: T[]): number {
    const length = this.length;

    const r = super.push(...items);

    this._CollectionChanged?.emit(
      new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Add, items, null, length, -1)
    );

    return r;
  }

  pop(): T | undefined {
    const r = super.pop();

    if (r != undefined) {
      this._CollectionChanged?.emit(
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Remove, null, [r], -1, this.length - 1)
      );
    }

    return r;
  }
}

//   "copyWithin",
//   "fill",
// x "pop",
// x "push",
//   "reverse",
//   "shift",
//   "sort",
//   "splice",
//   "unshift",
