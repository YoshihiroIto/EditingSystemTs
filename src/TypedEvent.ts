// ref: https://typescript-jp.gitbook.io/deep-dive/main-1/typed-event

export interface Listener<T> {
  (sender: unknown, event: T): void;
}

export interface Disposable {
  dispose(): void;
}

export class TypedEvent<T = EventArgs> {
  private listeners: Listener<T>[] = [];

  on(listener: Listener<T>): Disposable {
    this.listeners.push(listener);

    return {
      dispose: () => this.off(listener),
    };
  }

  off(listener: Listener<T>): void {
    const callbackIndex = this.listeners.indexOf(listener);
    if (callbackIndex > -1) {
      this.listeners.splice(callbackIndex, 1);
    }
  }

  emit(sender: unknown, event: T): void {
    for (const listener of this.listeners) {
      listener(sender, event);
    }
  }
}

export class EventArgs {
  public static readonly empty: EventArgs = new EventArgs();
}
