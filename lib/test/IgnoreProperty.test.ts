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

class TestModel implements NotifyPropertyChanged {
  readonly PropertyChanged = new TypedEvent<PropertyChangedEventArgs>();

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
