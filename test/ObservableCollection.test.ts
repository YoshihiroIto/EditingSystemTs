import { ObservableCollection } from '../src/ObservableCollection';
import { NotifyCollectionChangedEventArgs, NotifyCollectionChangedActions } from '../src/Event';

test('ObservableCollection<T>.push()', () => {
  const oc = new ObservableCollection<string>();

  oc.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  let count = 0;
  let args = NotifyCollectionChangedEventArgs.Empty;

  oc.CollectionChanged.on(e => {
    ++count;
    args = e;
  });

  expect(count).toBe(0);

  oc.push('A', 'B', 'C');
  expect(count).toBe(1);
  expect(args.action).toBe(NotifyCollectionChangedActions.Add);
  expect(args.newItems?.length).toBe(3);
  expect(args.oldItems).toBe(null);
  expect(args.newStartingIndex).toBe(10);
  expect(args.oldStartingIndex).toBe(-1);
  expect(oc.length).toBe(13);
});
