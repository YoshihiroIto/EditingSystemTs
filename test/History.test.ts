import { History } from '../src/History';
import { TypedEvent } from '../src/TypedEvent';
import { NotifyPropertyChanged, PropertyChangedEventArgs } from '../src/Event';

test('Initial', () => {
  const history = new History();

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();
});

test('Simple', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  model.valueA = 1;
  expect(model.valueA).toBe(1);
  expect(history.canUndo).toBeTruthy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeTruthy();

  model.valueA = 2;
  expect(model.valueA).toBe(2);
  expect(history.canUndo).toBeTruthy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeTruthy();

  history.undo();
  expect(model.valueA).toBe(1);
  expect(history.canUndo).toBeTruthy();
  expect(history.canRedo).toBeTruthy();
  expect(history.canClear).toBeTruthy();

  history.undo();
  expect(model.valueA).toBe(0);
  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeTruthy();
  expect(history.canClear).toBeTruthy();

  history.redo();
  expect(model.valueA).toBe(1);
  expect(history.canUndo).toBeTruthy();
  expect(history.canRedo).toBeTruthy();
  expect(history.canClear).toBeTruthy();

  history.redo();
  expect(model.valueA).toBe(2);
  expect(history.canUndo).toBeTruthy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeTruthy();

  history.clear();
  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();
});

test('PropertyChanged', () => {
  const history = new History();
  const model = new TestModel(history);

  let count = 0;
  let propertyName = '';

  model.propertyChanged.on((_, e) => {
    ++count;

    propertyName = e.propertyName;
  });

  expect(count).toBe(0);

  model.valueA = 1;

  expect(count).toBe(1);
  expect(propertyName).toBe('valueA');

  model.valueB = 10;
  expect(count).toBe(2);
  expect(propertyName).toBe('valueB');

  model.valueC = 100;
  expect(count).toBe(3);
  expect(propertyName).toBe('valueC');

  history.undo();
  expect(count).toBe(4);
  expect(propertyName).toBe('valueC');
  expect(model.valueC).toBe(0);

  history.undo();
  expect(count).toBe(5);
  expect(propertyName).toBe('valueB');
  expect(model.valueB).toBe(0);

  history.undo();
  expect(count).toBe(6);
  expect(propertyName).toBe('valueA');
  expect(model.valueA).toBe(0);
});

test('oldValue', () => {
  const history = new History();
  const model = new TestModel(history);

  let oldValue = -9999;

  model.propertyChanged.on((_, e) => {
    oldValue = e.oldValue as number;
  });

  model.valueA = 1;
  expect(oldValue).toBe(0);

  model.valueB = 10;
  expect(oldValue).toBe(0);

  model.valueC = 100;
  expect(oldValue).toBe(0);

  history.undo();
  expect(oldValue).toBe(100);

  history.undo();
  expect(oldValue).toBe(10);

  history.undo();
  expect(oldValue).toBe(1);
});

class TestModel implements NotifyPropertyChanged {
  readonly propertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  valueA = 0;
  valueB = 0;
  valueC = 0;

  constructor(history: History) {
    history.register(this);
  }
}
