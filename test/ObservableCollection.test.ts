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

test('ObservableCollection<T>.pop()', () => {
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

  const r = oc.pop();
  expect(count).toBe(2);
  expect(args.action).toBe(NotifyCollectionChangedActions.Remove);
  expect(args.newItems).toBeNull();
  expect(args.oldItems?.length).toBe(1);
  expect(args.oldItems != null ? args.oldItems[0] : 'XXXXX').toBe('C');
  expect(args.newStartingIndex).toBe(-1);
  expect(args.oldStartingIndex).toBe(11);
  expect(oc.length).toBe(12);
  expect(r).toBe('C');
});

test('ObservableCollection<T>.pop() empty', () => {
  const oc = new ObservableCollection<string>();

  let count = 0;

  oc.CollectionChanged.on(() => {
    ++count;
  });

  const r = oc.pop();
  expect(count).toBe(0);
  expect(oc.length).toBe(0);
  expect(r).toBe(undefined);
});

test('ObservableCollection<T>.shift()', () => {
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

  const r = oc.shift();
  expect(count).toBe(2);
  expect(args.action).toBe(NotifyCollectionChangedActions.Remove);
  expect(args.newItems).toBeNull();
  expect(args.oldItems?.length).toBe(1);
  expect(args.oldItems != null ? args.oldItems[0] : 'XXXXX').toBe('0');
  expect(args.newStartingIndex).toBe(-1);
  expect(args.oldStartingIndex).toBe(0);
  expect(oc.length).toBe(12);
  expect(r).toBe('0');
});

test('ObservableCollection<T>.shift() empty', () => {
  const oc = new ObservableCollection<string>();

  let count = 0;

  oc.CollectionChanged.on(() => {
    ++count;
  });

  const r = oc.shift();
  expect(count).toBe(0);
  expect(oc.length).toBe(0);
  expect(r).toBe(undefined);
});

test('ObservableCollection<T>.unshift()', () => {
  const oc = new ObservableCollection<string>();

  oc.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  let count = 0;
  let args = NotifyCollectionChangedEventArgs.Empty;

  oc.CollectionChanged.on(e => {
    ++count;
    args = e;
  });

  expect(count).toBe(0);

  oc.unshift('A', 'B', 'C');
  expect(count).toBe(1);
  expect(args.action).toBe(NotifyCollectionChangedActions.Add);
  expect(args.newItems?.length).toBe(3);
  expect(args.oldItems).toBe(null);
  expect(args.newStartingIndex).toBe(0);
  expect(args.oldStartingIndex).toBe(-1);
  expect(oc.length).toBe(13);
  expect(oc[0]).toBe('A');
  expect(oc[1]).toBe('B');
  expect(oc[2]).toBe('C');
  expect(oc[3]).toBe('0');
});
