import { History } from '../src/History';
import { TypedEvent } from '../src/TypedEvent';
import { NotifyPropertyChanged, PropertyChangedEventArgs } from '../src/Event';
import { EditingSystem } from '../src/Decorators';

test('Basic', () => {
  const history = new History();
  const model = new TestModel(history);

  model.valueA = 1;
  expect(history.undoRedoCount).toEqual([1, 0]);

  model.valueB = 1;
  expect(history.undoRedoCount).toEqual([2, 0]);

  model.valueC = 1;
  expect(history.undoRedoCount).toEqual([2, 0]);

  model.valueD = 1;
  expect(history.undoRedoCount).toEqual([2, 0]);

  history.undo();
  expect(history.undoRedoCount).toEqual([1, 1]);
  expect(model.valueB).toEqual(0);

  history.undo();
  expect(history.undoRedoCount).toEqual([0, 2]);
  expect(model.valueA).toEqual(0);

  expect(model.valueC).toEqual(1);
  expect(model.valueD).toEqual(1);
});

test('Ignore Property', () => {
  const history = new History();
  const model = new TestModel(history);

  let lastPropertyName = '';

  model.propertyChanged.on((_, e) => {
    lastPropertyName = e.propertyName;
  });

  model.valueA = 1;
  expect(lastPropertyName).toEqual('valueA');

  model.valueB = 1;
  expect(lastPropertyName).toEqual('valueB');

  model.valueC = 1;
  expect(lastPropertyName).toEqual('valueC');

  model.valueD = 1;
  expect(lastPropertyName).toEqual('valueD');

  history.undo();
  expect(lastPropertyName).toEqual('valueB');

  history.undo();
  expect(lastPropertyName).toEqual('valueA');
});

class TestModel implements NotifyPropertyChanged {
  readonly propertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  valueA = 0;
  valueB = 0;

  @EditingSystem.ignore
  valueC = 0;

  @EditingSystem.ignore
  valueD = 0;

  constructor(history: History) {
    history.register(this);
  }
}
