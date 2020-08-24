import { EditableModelBase } from "../src/EditableModelBase";
import { History } from "../src/History";

test("simple", () => {
  const model = new TestModel_simple();

  expect(model.history).toBe(null);
});

test("SetupEditingSystem", () => {
  const history = new History();
  const model = new TestModel_SetupEditingSystem(history);

  expect(model.history).toBe(history);
});

test("Basic op", () => {
  const history = new History();
  const model = new TestModel_HasNumberField(history);

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

class TestModel_simple extends EditableModelBase {}

class TestModel_SetupEditingSystem extends EditableModelBase {
  constructor(history: History) {
    super();
    this.SetupEditingSystem(history);
  }
}

class TestModel_HasNumberField extends EditableModelBase {
  get value() {
    return this._value;
  }
  set value(v: number) {
    this.SetEditableProperty(
      (v) => (this._value = v),
      this._value,
      v,
      nameof(this.value)
    );
  }

  private _value = 0;

  constructor(history: History) {
    super();
    this.SetupEditingSystem(history);
  }
}
