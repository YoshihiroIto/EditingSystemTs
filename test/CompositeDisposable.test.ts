import { CompositeDisposable } from '../src/CompositeDisposable';
import { Disposable } from '../src/TypedEvent';

let count = 0;

class DisposableModel implements Disposable {
  dispose(): void {
    ++count;
  }
}

test('Basic', () => {
  const compositeDisposable = new CompositeDisposable();

  compositeDisposable.push(new DisposableModel());
  compositeDisposable.push(new DisposableModel());
  compositeDisposable.push(new DisposableModel());

  compositeDisposable.dispose();

  console.log(count);

  expect(count).toEqual(3);
});
