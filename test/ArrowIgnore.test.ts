import { History } from '../src/History';
import { TypedEvent } from '../src/TypedEvent';
import { NotifyPropertyChanged, PropertyChangedEventArgs } from '../src/Event';

test('arrowPropertyNames', () => {
  const history = new History();
  const model = new TestModel();

  history.register(model, { arrowPropertyNames: new Set<string>(['valueA', 'valueB']) });

  expect(history.undoRedoCount).toEqual([0, 0]);

  model.valueA = 123;
  expect(history.undoRedoCount).toEqual([1, 0]);

  model.valueB = 123;
  expect(history.undoRedoCount).toEqual([2, 0]);

  model.valueC = 123;
  expect(history.undoRedoCount).toEqual([2, 0]);

  model.valueD = 123;
  expect(history.undoRedoCount).toEqual([2, 0]);

  history.undo();
  expect(model.valueA).toEqual(123);
  expect(model.valueB).toEqual(0);
  expect(model.valueC).toEqual(123);
  expect(model.valueD).toEqual(123);
});

test('arrowPropertyNames', () => {
  const history = new History();
  const model = new TestModel();

  history.register(model, { ignorePropertyNames: new Set<string>(['valueA', 'valueB']) });

  expect(history.undoRedoCount).toEqual([0, 0]);

  model.valueA = 123;
  expect(history.undoRedoCount).toEqual([0, 0]);

  model.valueB = 123;
  expect(history.undoRedoCount).toEqual([0, 0]);

  model.valueC = 123;
  expect(history.undoRedoCount).toEqual([1, 0]);

  model.valueD = 123;
  expect(history.undoRedoCount).toEqual([2, 0]);

  history.undo();
  expect(model.valueA).toEqual(123);
  expect(model.valueB).toEqual(123);
  expect(model.valueC).toEqual(123);
  expect(model.valueD).toEqual(0);
});

class TestModel implements NotifyPropertyChanged {
  readonly propertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  valueA = 0;
  valueB = 0;
  valueC = 0;
  valueD = 0;
}
