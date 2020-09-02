import { History } from '../src/History';
import { TypedEvent } from '../src/TypedEvent';
import { NotifyPropertyChanged, PropertyChangedEventArgs } from '../src/Event';

test('Basic', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  history.beginPause();
  {
    model.valueA = 10;
    model.valueA = 11;
    model.valueA = 12;

    model.valueB = 'A';
    model.valueB = 'B';
    model.valueB = 'C';
  }
  history.endPause();

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();
});

test('NestingPause', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  history.beginPause();
  {
    model.valueA = 10;

    history.beginPause();
    {
      model.valueA = 11;

      history.beginPause();
      {
        model.valueA = 12;
        model.valueB = 'A';
      }
      history.endPause();

      model.valueB = 'B';
    }
    history.endPause();

    model.valueB = 'C';
  }
  history.endPause();

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();
});

test('Cannot call undo during pause', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  model.valueA = 999;
  model.valueB = 'XYZ';

  history.beginPause();

  expect(() => history.undo()).toThrow();
});

test('Cannot call redo during pause', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  model.valueA = 999;
  model.valueB = 'XYZ';

  history.beginPause();

  expect(() => history.redo()).toThrow();
});

test('Pause has not begun', () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.canUndo).toBeFalsy();
  expect(history.canRedo).toBeFalsy();
  expect(history.canClear).toBeFalsy();

  model.valueA = 999;
  model.valueB = 'XYZ';

  expect(() => history.endPause()).toThrow();
});

class TestModel implements NotifyPropertyChanged {
  readonly propertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  valueA = 0;
  valueB = '';

  constructor(history: History) {
    history.register(this);
  }
}
