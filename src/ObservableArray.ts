import { TypedEvent } from './TypedEvent';
import { NotifyCollectionChangedEventArgs, NotifyCollectionChangedActions } from './Event';

export class ObservableArray<T> extends Array<T> {
  get CollectionChanged(): TypedEvent<NotifyCollectionChangedEventArgs> {
    this._CollectionChanged ??= new TypedEvent<NotifyCollectionChangedEventArgs>();

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
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Remove, null, [r], -1, this.length)
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
    const old = Array.from(this);

    const r = super.sort(compareFn);

    if (r != undefined) {
      this._CollectionChanged?.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Reset, null, old, -1, 0)
      );
    }

    return r;
  }

  reverse(): T[] {
    const old = Array.from(this);

    const r = super.reverse();

    if (r != undefined) {
      this._CollectionChanged?.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Reset, null, old, -1, 0)
      );
    }

    return r;
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    if (deleteCount == null) {
      deleteCount = this.length - start;
    }

    const r = super.splice(start, deleteCount, ...items);

    const isBatch = deleteCount > 0 && items.length > 0;

    if (deleteCount > 0) {
      this._CollectionChanged?.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Remove, null, r, -1, start, {
          isBeginBatch: isBatch,
        })
      );
    }

    if (items.length > 0) {
      this._CollectionChanged?.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Add, items, null, start, -1, {
          isEndBatch: isBatch,
        })
      );
    }

    return r;
  }
}
