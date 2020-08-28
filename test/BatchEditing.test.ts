import { History } from '../src/History';
import { TypedEvent } from '../src/TypedEvent';
import { NotifyPropertyChanged, PropertyChangedEventArgs } from '../src/Event';

test('Basic', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  model.valueA = 999;
  model.valueB = 'XYZ';

  history.beginBatch();
  {
    model.valueA = 10;
    model.valueA = 11;
    model.valueA = 12;

    model.valueB = 'A';
    model.valueB = 'B';
    model.valueB = 'C';
  }
  history.endBatch();

  history.undo();

  expect(model.valueA).toBe(999);
  expect(model.valueB).toBe('XYZ');

  history.redo();
  expect(model.valueA).toBe(12);
  expect(model.valueB).toBe('C');
});

test('Empty', () => {
  const history = new History();

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  history.beginBatch();
  history.endBatch();

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();
});

test('NestingBatch', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  model.valueA = 999;
  model.valueB = 'XYZ';

  history.beginBatch();
  {
    model.valueA = 10;

    history.beginBatch();
    {
      model.valueA = 11;

      history.beginBatch();
      {
        model.valueA = 12;
        model.valueB = 'A';
      }
      history.endBatch();

      model.valueB = 'B';
    }
    history.endBatch();

    model.valueB = 'C';
  }
  history.endBatch();

  history.undo();

  expect(model.valueA).toBe(999);
  expect(model.valueB).toBe('XYZ');

  history.redo();
  expect(model.valueA).toBe(12);
  expect(model.valueB).toBe('C');
});

class TestModel implements NotifyPropertyChanged {
  readonly PropertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  valueA = 0;
  valueB = '';

  constructor(history: History) {
    history.register(this);
  }
}
