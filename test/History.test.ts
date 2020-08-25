import { History } from "../src/History";
import { TypedEvent } from "../src/TypedEvent";
import {
  NotifyPropertyChanged,
  PropertyChangedEventArgs,
} from "../src/NotifyPropertyChanged";

test("Initial", () => {
  const history = new History();

  expect(history.CanUndo).toBeFalsy();
  expect(history.CanRedo).toBeFalsy();
  expect(history.CanClear).toBeFalsy();
});

test("Simple", () => {
  const history = new History();
  const model = new TestModel(history);

  expect(history.CanUndo).toBeFalsy();
  expect(history.CanRedo).toBeFalsy();
  expect(history.CanClear).toBeFalsy();

  model.valueA = 1;
  expect(model.valueA).toBe(1);
  expect(history.CanUndo).toBeTruthy();
  expect(history.CanRedo).toBeFalsy();
  expect(history.CanClear).toBeTruthy();

  model.valueA = 2;
  expect(model.valueA).toBe(2);
  expect(history.CanUndo).toBeTruthy();
  expect(history.CanRedo).toBeFalsy();
  expect(history.CanClear).toBeTruthy();

  history.Undo();
  expect(model.valueA).toBe(1);
  expect(history.CanUndo).toBeTruthy();
  expect(history.CanRedo).toBeTruthy();
  expect(history.CanClear).toBeTruthy();

  history.Undo();
  expect(model.valueA).toBe(0);
  expect(history.CanUndo).toBeFalsy();
  expect(history.CanRedo).toBeTruthy();
  expect(history.CanClear).toBeTruthy();

  history.Redo();
  expect(model.valueA).toBe(1);
  expect(history.CanUndo).toBeTruthy();
  expect(history.CanRedo).toBeTruthy();
  expect(history.CanClear).toBeTruthy();

  history.Redo();
  expect(model.valueA).toBe(2);
  expect(history.CanUndo).toBeTruthy();
  expect(history.CanRedo).toBeFalsy();
  expect(history.CanClear).toBeTruthy();

  history.Clear();
  expect(history.CanUndo).toBeFalsy();
  expect(history.CanRedo).toBeFalsy();
  expect(history.CanClear).toBeFalsy();
});

test("PropertyChanged", () => {
  const history = new History();
  const model = new TestModel(history);

  let count = 0;
  let propertyName = "";

  model.PropertyChanged.on((e) => {
    ++count;
    propertyName = e.PropertyName;
  });

  expect(count).toBe(0);

  model.valueA = 1;

  expect(count).toBe(1);
  expect(propertyName).toBe("valueA");

  model.valueB = 10;
  expect(count).toBe(2);
  expect(propertyName).toBe("valueB");

  model.valueC = 100;
  expect(count).toBe(3);
  expect(propertyName).toBe("valueC");

  history.Undo();
  expect(count).toBe(4);
  expect(propertyName).toBe("valueC");
  expect(model.valueC).toBe(0);

  history.Undo();
  expect(count).toBe(5);
  expect(propertyName).toBe("valueB");
  expect(model.valueB).toBe(0);

  history.Undo();
  expect(count).toBe(6);
  expect(propertyName).toBe("valueA");
  expect(model.valueA).toBe(0);
});

class TestModel implements NotifyPropertyChanged {
  readonly PropertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  valueA = 0;
  valueB = 0;
  valueC = 0;

  constructor(history: History) {
    history.InitializeModel(this);
  }
}
