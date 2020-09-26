import { Disposable } from './TypedEvent';

export class CompositeDisposable extends Array<Disposable> implements Disposable {
  dispose(): void {
    for (const d of this) {
      d.dispose();
    }
  }
}
