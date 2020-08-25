import { History } from "../src/History";

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

  model.value = 1;
  expect(model.value).toBe(1);
  expect(history.CanUndo).toBeTruthy();
  expect(history.CanRedo).toBeFalsy();
  expect(history.CanClear).toBeTruthy();

  model.value = 2;
  expect(model.value).toBe(2);
  expect(history.CanUndo).toBeTruthy();
  expect(history.CanRedo).toBeFalsy();
  expect(history.CanClear).toBeTruthy();

  history.Undo();
  expect(model.value).toBe(1);
  expect(history.CanUndo).toBeTruthy();
  expect(history.CanRedo).toBeTruthy();
  expect(history.CanClear).toBeTruthy();

  history.Undo();
  expect(model.value).toBe(0);
  expect(history.CanUndo).toBeFalsy();
  expect(history.CanRedo).toBeTruthy();
  expect(history.CanClear).toBeTruthy();

  history.Redo();
  expect(model.value).toBe(1);
  expect(history.CanUndo).toBeTruthy();
  expect(history.CanRedo).toBeTruthy();
  expect(history.CanClear).toBeTruthy();

  history.Redo();
  expect(model.value).toBe(2);
  expect(history.CanUndo).toBeTruthy();
  expect(history.CanRedo).toBeFalsy();
  expect(history.CanClear).toBeTruthy();

  history.Clear();
  expect(history.CanUndo).toBeFalsy();
  expect(history.CanRedo).toBeFalsy();
  expect(history.CanClear).toBeFalsy();
});

class TestModel {
  public value = 0;

  constructor(history: History) {
    history.InitializeModel(this);
  }
}
