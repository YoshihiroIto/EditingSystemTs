import { ObservableArray } from '../src/ObservableArray';
import { NotifyCollectionChangedEventArgs, NotifyCollectionChangedActions } from '../src/Event';

test('ObservableArray<T>.push()', () => {
  const oc = new ObservableArray<string>();

  oc.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  let count = 0;
  let args = NotifyCollectionChangedEventArgs.empty;

  oc.collectionChanged.on((_, e) => {
    ++count;
    args = e;
  });

  expect(count).toBe(0);

  oc.push('A', 'B', 'C');
  expect(count).toBe(1);
  expect(args.action).toBe(NotifyCollectionChangedActions.Add);
  expect(args.newItems?.length).toBe(3);
  expect(args.oldItems).toBeNull();
  expect(args.newStartingIndex).toBe(10);
  expect(args.oldStartingIndex).toBe(-1);
  expect(oc.length).toBe(13);
});

test('ObservableArray<T>.pop()', () => {
  const oc = new ObservableArray<string>();

  oc.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  let count = 0;
  let args = NotifyCollectionChangedEventArgs.empty;

  oc.collectionChanged.on((_, e) => {
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
  expect(args.oldStartingIndex).toBe(12);
  expect(oc.length).toBe(12);
  expect(r).toBe('C');
});

test('ObservableArray<T>.pop() empty', () => {
  const oc = new ObservableArray<string>();

  let count = 0;

  oc.collectionChanged.on(() => {
    ++count;
  });

  const r = oc.pop();
  expect(count).toBe(0);
  expect(oc.length).toBe(0);
  expect(r).toBe(undefined);
});

test('ObservableArray<T>.shift()', () => {
  const oc = new ObservableArray<string>();

  oc.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  let count = 0;
  let args = NotifyCollectionChangedEventArgs.empty;

  oc.collectionChanged.on((_, e) => {
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

test('ObservableArray<T>.shift() empty', () => {
  const oc = new ObservableArray<string>();

  let count = 0;

  oc.collectionChanged.on(() => {
    ++count;
  });

  const r = oc.shift();
  expect(count).toBe(0);
  expect(oc.length).toBe(0);
  expect(r).toBe(undefined);
});

test('ObservableArray<T>.unshift()', () => {
  const oc = new ObservableArray<string>();

  oc.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  let count = 0;
  let args = NotifyCollectionChangedEventArgs.empty;

  oc.collectionChanged.on((_, e) => {
    ++count;
    args = e;
  });

  expect(count).toBe(0);

  oc.unshift('A', 'B', 'C');
  expect(count).toBe(1);
  expect(args.action).toBe(NotifyCollectionChangedActions.Add);
  expect(args.newItems?.length).toBe(3);
  expect(args.oldItems).toBeNull();
  expect(args.newStartingIndex).toBe(0);
  expect(args.oldStartingIndex).toBe(-1);
  expect(oc.length).toBe(13);
  expect(oc[0]).toBe('A');
  expect(oc[1]).toBe('B');
  expect(oc[2]).toBe('C');
  expect(oc[3]).toBe('0');
});

test('ObservableArray<T>.sort()', () => {
  const oc = new ObservableArray<string>();

  oc.push('9', '8', '7', '6', '5', '4', '3', '2', '1', '0');

  let count = 0;
  let args = NotifyCollectionChangedEventArgs.empty;

  oc.collectionChanged.on((_, e) => {
    ++count;
    args = e;
  });

  expect(count).toBe(0);

  oc.sort();
  expect(count).toBe(1);
  expect(args.action).toBe(NotifyCollectionChangedActions.Reset);
  expect(args.newItems).toBeNull();
  expect(args.newStartingIndex).toBe(-1);
  expect(args.oldStartingIndex).toBe(0);
  expect(oc.length).toBe(10);
});

test('ObservableArray<T>.reverse()', () => {
  const oc = new ObservableArray<string>();

  oc.push('9', '8', '7', '6', '5', '4', '3', '2', '1', '0');

  let count = 0;
  let args = NotifyCollectionChangedEventArgs.empty;

  oc.collectionChanged.on((_, e) => {
    ++count;
    args = e;
  });

  expect(count).toBe(0);

  oc.reverse();
  expect(count).toBe(1);
  expect(args.action).toBe(NotifyCollectionChangedActions.Reset);
  expect(args.newItems).toBeNull();
  expect(args.newStartingIndex).toBe(-1);
  expect(args.oldStartingIndex).toBe(0);
  expect(oc.length).toBe(10);
  expect(oc[0]).toBe('0');
  expect(oc[1]).toBe('1');
  expect(oc[2]).toBe('2');
  expect(oc[3]).toBe('3');
  expect(oc[4]).toBe('4');
  expect(oc[5]).toBe('5');
  expect(oc[6]).toBe('6');
  expect(oc[7]).toBe('7');
  expect(oc[8]).toBe('8');
  expect(oc[9]).toBe('9');
});

test('ObservableArray<T>.splice() deleteCount is null', () => {
  const oc = new ObservableArray<string>();

  oc.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  let count = 0;
  let args = NotifyCollectionChangedEventArgs.empty;

  oc.collectionChanged.on((_, e) => {
    ++count;
    args = e;
  });

  oc.splice(3);

  expect(count).toBe(1);
  expect(args.action).toBe(NotifyCollectionChangedActions.Remove);
  expect(args.newItems).toBeNull();
  expect(args.oldItems?.length).toBe(7);
  expect(args.newStartingIndex).toBe(-1);
  expect(args.oldStartingIndex).toBe(3);
  expect(oc.length).toBe(3);
  expect(oc[0]).toBe('0');
  expect(oc[1]).toBe('1');
  expect(oc[2]).toBe('2');
});

test('ObservableArray<T>.splice() deleteCount is not null', () => {
  const oc = new ObservableArray<string>();

  oc.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  let count = 0;
  let args = NotifyCollectionChangedEventArgs.empty;

  oc.collectionChanged.on((_, e) => {
    ++count;
    args = e;
  });

  oc.splice(3, 3);

  expect(count).toBe(1);
  expect(args.action).toBe(NotifyCollectionChangedActions.Remove);
  expect(args.newItems).toBeNull();
  expect(args.oldItems?.length).toBe(3);
  expect(args.newStartingIndex).toBe(-1);
  expect(args.oldStartingIndex).toBe(3);
  expect(oc.length).toBe(7);
  expect(oc[0]).toBe('0');
  expect(oc[1]).toBe('1');
  expect(oc[2]).toBe('2');
  expect(oc[3]).toBe('6');
  expect(oc[4]).toBe('7');
  expect(oc[5]).toBe('8');
  expect(oc[6]).toBe('9');
});

test('ObservableArray<T>.splice() deleteCount, items', () => {
  const oc = new ObservableArray<string>();

  oc.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  let count = 0;
  let args1 = NotifyCollectionChangedEventArgs.empty;
  let args2 = NotifyCollectionChangedEventArgs.empty;

  oc.collectionChanged.on((_, e) => {
    ++count;

    if (count === 1) {
      args1 = e;
    }

    if (count === 2) {
      args2 = e;
    }
  });

  oc.splice(3, 3, 'A', 'B', 'C');

  expect(count).toBe(2);

  expect(args1.action).toBe(NotifyCollectionChangedActions.Remove);
  expect(args1.newItems).toBeNull();
  expect(args1.oldItems?.length).toBe(3);
  expect(args1.newStartingIndex).toBe(-1);
  expect(args1.oldStartingIndex).toBe(3);

  expect(args2.action).toBe(NotifyCollectionChangedActions.Add);
  expect(args2.newItems?.length).toBe(3);
  expect(args2.oldItems).toBeNull();
  expect(args2.newStartingIndex).toBe(3);
  expect(args2.oldStartingIndex).toBe(-1);

  expect(oc.length).toBe(10);
  expect(oc[0]).toBe('0');
  expect(oc[1]).toBe('1');
  expect(oc[2]).toBe('2');
  expect(oc[3]).toBe('A');
  expect(oc[4]).toBe('B');
  expect(oc[5]).toBe('C');
  expect(oc[6]).toBe('6');
  expect(oc[7]).toBe('7');
  expect(oc[8]).toBe('8');
  expect(oc[9]).toBe('9');
});
