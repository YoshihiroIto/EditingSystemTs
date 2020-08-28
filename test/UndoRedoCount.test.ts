import { History } from '../src/History';
import { TypedEvent } from '../src/TypedEvent';
import { NotifyPropertyChanged, PropertyChangedEventArgs } from '../src/Event';
import { ObservableCollection } from '../src/ObservableCollection';

test('Basic', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.undoRedoCount).toEqual([0, 0]);

  model.valueA = 123;
  expect(history.undoRedoCount).toEqual([1, 0]);

  model.valueA = 456;
  expect(history.undoRedoCount).toEqual([2, 0]);

  history.undo();
  expect(history.undoRedoCount).toEqual([1, 1]);

  history.clear();
  expect(history.undoRedoCount).toEqual([0, 0]);

  model.valueB.push(1, 2, 3);
  expect(history.undoRedoCount).toEqual([1, 0]);

  history.undo();
  expect(history.undoRedoCount).toEqual([0, 1]);

  history.redo();
  expect(history.undoRedoCount).toEqual([1, 0]);

  model.valueB.reverse();
  expect(history.undoRedoCount).toEqual([2, 0]);

  history.clear();
  expect(history.undoRedoCount).toEqual([0, 0]);
});

class TestModel implements NotifyPropertyChanged {
  readonly PropertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  valueA = 0;
  valueB = new ObservableCollection<number>();

  constructor(history: History) {
    history.register(this);
  }
}
