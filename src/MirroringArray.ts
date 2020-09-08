import { Assert } from './Assert';
import { NotifyCollectionChangedActions, NotifyCollectionChangedEventArgs } from './Event';
import { ObservableArray } from './ObservableArray';

export default function createMirroringArray<T>(source: ObservableArray<T>): MirroringArray<T> {
  const target = new MirroringArrayInternal<T>();

  target.setup(source);

  return target;
}

export abstract class MirroringArray<T> extends Array<T> {
  abstract dispose(): void;
}

class MirroringArrayInternal<T> extends MirroringArray<T> {
  setup(source: ObservableArray<T>): void {
    this.source = source;

    this.push(...source);
    this.source.collectionChanged.on(this.childrenChanged);
  }

  dispose(): void {
    this.source?.collectionChanged.off(this.childrenChanged);
  }

  private source: ObservableArray<T> | null = null;

  private childrenChanged = (sender: unknown, e: NotifyCollectionChangedEventArgs): void => {
    switch (e.action) {
      case NotifyCollectionChangedActions.Add: {
        const addItems = e.newItems as T[];
        Assert.isNotNull(addItems);

        this.splice(e.newStartingIndex, 0, ...addItems);

        break;
      }

      case NotifyCollectionChangedActions.Remove: {
        const oldItems = e.oldItems as T[];
        Assert.isNotNull(oldItems);

        this.splice(e.oldStartingIndex, oldItems.length);

        break;
      }

      case NotifyCollectionChangedActions.Reset: {
        const newItems = sender as T[];
        Assert.isNotNull(newItems);

        this.splice(0);
        this.push(...newItems);
        break;
      }

      default:
        throw new Error(`Not implement: ${e.action}`);
    }
  };
}
