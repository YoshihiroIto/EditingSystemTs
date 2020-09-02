import { History } from '../src/History';
import { TypedEvent } from '../src/TypedEvent';
import { NotifyPropertyChanged, PropertyChangedEventArgs } from '../src/Event';

test('Basic', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.undoRedoCount).toEqual([0, 0]);

  model.valueA = 123;
  expect(history.undoRedoCount).toEqual([0, 0]);

  model.valueA = 456;
  expect(history.undoRedoCount).toEqual([0, 0]);

  history.undo();
  expect(history.undoRedoCount).toEqual([0, 0]);
  expect(model.valueA).toEqual(999);

  history.clear();
  expect(history.undoRedoCount).toEqual([0, 0]);
});

class TestModel implements NotifyPropertyChanged {
  readonly PropertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  get valueA() {
    return 999;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  set valueA(value: number) {}

  private _valueA = 0;

  constructor(history: History) {
    history.register(this);
  }
}
