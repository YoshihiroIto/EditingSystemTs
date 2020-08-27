// https://typescript-jp.gitbook.io/deep-dive/main-1/typed-event

export interface Listener<T> {
  (event: T): void;
}

export interface Disposable {
  dispose(): void;
}

export class TypedEvent<T = EventArgs> {
  private listeners: Listener<T>[] = [];

  on = (listener: Listener<T>): Disposable => {
    this.listeners.push(listener);

    return {
      dispose: () => this.off(listener),
    };
  };

  off = (listener: Listener<T>): void => {
    const callbackIndex = this.listeners.indexOf(listener);
    if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
  };

  emit = (event: T): void => {
    for (const listener of this.listeners) {
      listener(event);
    }
  };

  pipe = (te: TypedEvent<T>): Disposable => {
    return this.on(e => te.emit(e));
  };
}

export class EventArgs {
  public static readonly Empty: EventArgs = new EventArgs();
}
