import { EventArgs, TypedEvent } from "./TypedEvent";

export interface NotifyPropertyChanged {
  readonly PropertyChanged: TypedEvent<PropertyChangedEventArgs>;
}

export class PropertyChangedEventArgs extends EventArgs {
  constructor(public readonly propertyName: string) {
    super();
  }
}
