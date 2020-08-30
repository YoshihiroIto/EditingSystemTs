import { History } from '../../../lib/src/History';
import { TypedEvent } from '../../../lib/src/TypedEvent';
import { NotifyPropertyChanged, PropertyChangedEventArgs } from '../../../lib/src/Event';

export class TestModel implements NotifyPropertyChanged {
  readonly PropertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  valueA = 123;
  valueB = '';

  constructor(history: History) {
    history.register(this);
  }
}
