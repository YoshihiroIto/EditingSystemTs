import { History } from '../src/History';
import { TypedEvent } from '../src/TypedEvent';
import { NotifyPropertyChanged, PropertyChangedEventArgs } from '../src/Event';

test('Basic', () => {
  const history = new History();
  const model = new TestModel(history);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyModel = model as any;
  expect(anyModel['nonConfigurable']).toBe('abc');
});

class TestModel implements NotifyPropertyChanged {
  readonly propertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  constructor(history: History) {
    Object.defineProperty(this, 'nonConfigurable', { value: 'abc' });

    history.register(this);
  }
}
