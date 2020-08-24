import { History } from "../src/History";

export class EditableModelBase {
  get history(): History | null {
    return this._history;
  }

  private _history: History | null = null;

  protected SetupEditingSystem(history: History | null): void {
    this._history = history;
  }

  protected SetEditableProperty<T>(
    setValue: SetValueFunction<T>,
    currentValue: T,
    nextValue: T,
    propertyName: string
  ): void {
    if (currentValue === nextValue) return;

    const oldValue = currentValue;

    if (this._history != null) {
      this._history.Push(
        () => {
          setValue(oldValue);
          this.RaisePropertyChanged(propertyName);
        },
        () => {
          setValue(nextValue);
          this.RaisePropertyChanged(propertyName);
        }
      );
    }

    setValue(nextValue);
  }

  private RaisePropertyChanged(propertyName: string) {
    console.log(`RaisePropertyChanged: ${propertyName}`);
  }
}

interface SetValueFunction<T> extends Function {
  (v: T): void;
}
