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
      this,
      new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Add, items, null, length, -1)
    );

    return r;
  }

  pop(): T | undefined {
    const r = super.pop();

    if (r != undefined) {
      this._CollectionChanged?.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Remove, null, [r], -1, this.length - 1)
      );
    }

    return r;
  }

  shift(): T | undefined {
    const r = super.shift();

    if (r != undefined) {
      this._CollectionChanged?.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Remove, null, [r], -1, 0)
      );
    }

    return r;
  }

  unshift(...items: T[]): number {
    const r = super.unshift(...items);

    this._CollectionChanged?.emit(
      this,
      new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Add, items, null, 0, -1)
    );

    return r;
  }

  sort(compareFn?: (a: T, b: T) => number): this {
    const r = super.sort(compareFn);

    if (r != undefined) {
      this._CollectionChanged?.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Reset, null, null, -1, -1)
      );
    }

    return r;
  }

  reverse(): T[] {
    const r = super.reverse();

    if (r != undefined) {
      this._CollectionChanged?.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Reset, null, null, -1, -1)
      );
    }

    return r;
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    if (deleteCount == null) {
      deleteCount = this.length;
    }

    const r = super.splice(start, deleteCount, ...items);

    if (deleteCount > 0) {
      this._CollectionChanged?.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Remove, null, r, -1, start)
      );
    }

    if (items.length > 0) {
      this._CollectionChanged?.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Add, items, null, start, -1)
      );
    }

    return r;
  }
}
