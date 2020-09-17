import { History } from '../src/History';
import { TypedEvent } from '../src/TypedEvent';
import { NotifyPropertyChanged, PropertyChangedEventArgs } from '../src/Event';
import { ObservableArray } from '../src/ObservableArray';

test('Property', () => {
  const history = new History();
  const model = new TestModel(history);

  let count = 0;
  history.edited.on(() => {
    ++count;
  });

  model.valueA = 100;
  expect(count).toEqual(1);

  model.valueA = 200;
  expect(count).toEqual(2);

  history.undo();
  expect(count).toEqual(3);

  history.redo();
  expect(count).toEqual(4);
});

test('ObservableArray', () => {
  const history = new History();
  const model = new TestModel(history);

  let count = 0;
  history.edited.on(() => {
    ++count;
  });

  model.valueB.push(100);
  expect(count).toEqual(1);

  model.valueB.pop();
  expect(count).toEqual(2);

  history.undo();
  expect(count).toEqual(3);

  history.redo();
  expect(count).toEqual(4);

  model.valueB.sort();
  expect(count).toEqual(5);
});

class TestModel implements NotifyPropertyChanged {
  readonly propertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  valueA = 0;
  valueB = new ObservableArray<number>();

  constructor(history: History) {
    history.register(this);
  }
}
