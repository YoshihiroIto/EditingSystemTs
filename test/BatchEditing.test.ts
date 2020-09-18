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

test('empty', () => {
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

test('Cannot call undo during batch recording', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  model.valueA = 999;
  model.valueB = 'XYZ';

  history.beginBatch();

  model.valueA = 888;

  expect(() => history.undo()).toThrow();
});

test('Cannot call redo during batch recording', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  model.valueA = 999;
  model.valueB = 'XYZ';

  history.beginBatch();

  model.valueA = 888;

  expect(() => history.redo()).toThrow();
});

test('Can call undo during batch recording without editing', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  model.valueA = 999;
  model.valueB = 'XYZ';

  history.beginBatch();

  try {
    history.undo();
  } catch {
    expect(false).toBe(true);
  }
});

test('Can call redo during batch recording without editing', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  model.valueA = 999;
  model.valueB = 'XYZ';

  history.beginBatch();

  try {
    history.redo();
  } catch {
    expect(false).toBe(true);
  }
});

test('Batch recording has not begun ', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  model.valueA = 999;
  model.valueB = 'XYZ';

  expect(() => history.endBatch()).toThrow();
});

class TestModel implements NotifyPropertyChanged {
  readonly propertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  valueA = 0;
  valueB = '';

  constructor(history: History) {
    history.register(this);
  }
}
