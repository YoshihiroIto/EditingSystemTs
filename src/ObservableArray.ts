import { TypedEvent } from './TypedEvent';
import { NotifyCollectionChangedEventArgs, NotifyCollectionChangedActions } from './Event';

export class ObservableArray<T> extends Array<T> {
  readonly collectionChanged = new TypedEvent<NotifyCollectionChangedEventArgs>();

  constructor() {
    super();
  }

  push(...items: T[]): number {
    const length = this.length;

    const r = super.push(...items);

    this.collectionChanged.emit(
      this,
      new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Add, items, null, length, -1)
    );

    return r;
  }

  pop(): T | undefined {
    const r = super.pop();

    if (r != undefined) {
      this.collectionChanged.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Remove, null, [r], -1, this.length)
      );
    }

    return r;
  }

  shift(): T | undefined {
    const r = super.shift();

    if (r != undefined) {
      this.collectionChanged.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Remove, null, [r], -1, 0)
      );
    }

    return r;
  }

  unshift(...items: T[]): number {
    const r = super.unshift(...items);

    this.collectionChanged.emit(
      this,
      new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Add, items, null, 0, -1)
    );

    return r;
  }

  sort(compareFn?: (a: T, b: T) => number): this {
    const old = Array.from(this);

    const r = super.sort(compareFn);

    if (r != undefined) {
      this.collectionChanged.emit(
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
      this.collectionChanged.emit(
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
      this.collectionChanged.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Remove, null, r, -1, start, {
          isBeginBatch: isBatch,
        })
      );
    }

    if (items.length > 0) {
      this.collectionChanged.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Add, items, null, start, -1, {
          isEndBatch: isBatch,
        })
      );
    }

    return r;
  }

  readonly pushCore = (...items: T[]): number => {
    const length = this.length;

    // `push' is required to be overridden, eg vue.js
    const r = this.push(...items);

    this.collectionChanged.emit(
      this,
      new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Add, items, null, length, -1)
    );

    return r;
  };

  readonly spliceCore = (start: number, deleteCount?: number, ...items: T[]): T[] => {
    if (deleteCount == null) {
      deleteCount = this.length - start;
    }

    // `splice' is required to be overridden, eg vue.js
    const r = this.splice(start, deleteCount, ...items);

    const isBatch = deleteCount > 0 && items.length > 0;

    if (deleteCount > 0) {
      this.collectionChanged.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Remove, null, r, -1, start, {
          isBeginBatch: isBatch,
        })
      );
    }

    if (items.length > 0) {
      this.collectionChanged.emit(
        this,
        new NotifyCollectionChangedEventArgs(NotifyCollectionChangedActions.Add, items, null, start, -1, {
          isEndBatch: isBatch,
        })
      );
    }

    return r;
  };
}
