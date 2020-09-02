import { History } from '../src/History';
import { TypedEvent } from '../src/TypedEvent';
import { NotifyPropertyChanged, PropertyChangedEventArgs } from '../src/Event';
import { ObservableArray } from '../src/ObservableArray';

test('push()', () => {
  const history = new History();
  const model = new TestModel(history);

  model.valueOc.push('A');
  expect(model.valueOc.length).toBe(1);

  model.valueOc.push('B');
  expect(model.valueOc.length).toBe(2);

  model.valueOc.push('C');
  expect(model.valueOc.length).toBe(3);

  history.undo();
  expect(model.valueOc.length).toBe(2);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');

  history.undo();
  expect(model.valueOc.length).toBe(1);
  expect(model.valueOc[0]).toBe('A');

  history.redo();
  expect(model.valueOc.length).toBe(2);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');

  history.redo();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');

  model.valueOc.push('D', 'E', 'F');
  expect(model.valueOc.length).toBe(6);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');
  expect(model.valueOc[3]).toBe('D');
  expect(model.valueOc[4]).toBe('E');
  expect(model.valueOc[5]).toBe('F');

  history.undo();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');

  history.redo();
  expect(model.valueOc.length).toBe(6);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');
  expect(model.valueOc[3]).toBe('D');
  expect(model.valueOc[4]).toBe('E');
  expect(model.valueOc[5]).toBe('F');
});

test('pop()', () => {
  const history = new History();
  const model = new TestModel(history);

  model.valueOc.push('A');
  expect(model.valueOc.length).toBe(1);

  model.valueOc.push('B');
  expect(model.valueOc.length).toBe(2);

  model.valueOc.push('C');
  expect(model.valueOc.length).toBe(3);

  model.valueOc.pop();
  expect(model.valueOc.length).toBe(2);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');

  history.undo();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');

  history.redo();
  expect(model.valueOc.length).toBe(2);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
});

test('shift()', () => {
  const history = new History();
  const model = new TestModel(history);

  model.valueOc.push('A');
  expect(model.valueOc.length).toBe(1);

  model.valueOc.push('B');
  expect(model.valueOc.length).toBe(2);

  model.valueOc.push('C');
  expect(model.valueOc.length).toBe(3);

  model.valueOc.shift();
  expect(model.valueOc.length).toBe(2);
  expect(model.valueOc[0]).toBe('B');
  expect(model.valueOc[1]).toBe('C');

  history.undo();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');

  history.redo();
  expect(model.valueOc.length).toBe(2);
  expect(model.valueOc[0]).toBe('B');
  expect(model.valueOc[1]).toBe('C');
});

test('unshift()', () => {
  const history = new History();
  const model = new TestModel(history);

  model.valueOc.push('A');
  expect(model.valueOc.length).toBe(1);

  model.valueOc.push('B');
  expect(model.valueOc.length).toBe(2);

  model.valueOc.push('C');
  expect(model.valueOc.length).toBe(3);

  model.valueOc.unshift('0', '1', '2');
  expect(model.valueOc.length).toBe(6);
  expect(model.valueOc[0]).toBe('0');
  expect(model.valueOc[1]).toBe('1');
  expect(model.valueOc[2]).toBe('2');
  expect(model.valueOc[3]).toBe('A');
  expect(model.valueOc[4]).toBe('B');
  expect(model.valueOc[5]).toBe('C');

  history.undo();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');

  history.redo();
  expect(model.valueOc.length).toBe(6);
  expect(model.valueOc[0]).toBe('0');
  expect(model.valueOc[1]).toBe('1');
  expect(model.valueOc[2]).toBe('2');
  expect(model.valueOc[3]).toBe('A');
  expect(model.valueOc[4]).toBe('B');
  expect(model.valueOc[5]).toBe('C');
});

test('sort()', () => {
  const history = new History();
  const model = new TestModel(history);

  model.valueOc.push('C');
  expect(model.valueOc.length).toBe(1);

  model.valueOc.push('B');
  expect(model.valueOc.length).toBe(2);

  model.valueOc.push('A');
  expect(model.valueOc.length).toBe(3);

  model.valueOc.sort();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');

  history.undo();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('C');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('A');

  history.redo();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');
});

test('reverse()', () => {
  const history = new History();
  const model = new TestModel(history);

  model.valueOc.push('C');
  expect(model.valueOc.length).toBe(1);

  model.valueOc.push('B');
  expect(model.valueOc.length).toBe(2);

  model.valueOc.push('A');
  expect(model.valueOc.length).toBe(3);

  model.valueOc.reverse();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');

  history.undo();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('C');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('A');

  history.redo();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');
});

test('ObservableArray<T>.splice() deleteCount is null', () => {
  const history = new History();
  const model = new TestModel(history);

  model.valueOc.push('A');
  expect(model.valueOc.length).toBe(1);

  model.valueOc.push('B');
  expect(model.valueOc.length).toBe(2);

  model.valueOc.push('C');
  expect(model.valueOc.length).toBe(3);

  model.valueOc.splice(0);
  expect(model.valueOc.length).toBe(0);

  history.undo();
  expect(model.valueOc.length).toBe(3);
  expect(model.valueOc[0]).toBe('A');
  expect(model.valueOc[1]).toBe('B');
  expect(model.valueOc[2]).toBe('C');

  history.redo();
  expect(model.valueOc.length).toBe(0);
});

test('ObservableArray<T>.splice() deleteCount is not null', () => {
  const history = new History();
  const model = new TestModel(history);

  model.valueOc.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  model.valueOc.splice(3, 3);
  expect(model.valueOc.length).toBe(7);
  expect(model.valueOc[0]).toBe('0');
  expect(model.valueOc[1]).toBe('1');
  expect(model.valueOc[2]).toBe('2');
  expect(model.valueOc[3]).toBe('6');
  expect(model.valueOc[4]).toBe('7');
  expect(model.valueOc[5]).toBe('8');
  expect(model.valueOc[6]).toBe('9');

  history.undo();
  expect(model.valueOc.length).toBe(10);
  expect(model.valueOc[0]).toBe('0');
  expect(model.valueOc[1]).toBe('1');
  expect(model.valueOc[2]).toBe('2');
  expect(model.valueOc[3]).toBe('3');
  expect(model.valueOc[4]).toBe('4');
  expect(model.valueOc[5]).toBe('5');
  expect(model.valueOc[6]).toBe('6');
  expect(model.valueOc[7]).toBe('7');
  expect(model.valueOc[8]).toBe('8');
  expect(model.valueOc[9]).toBe('9');

  history.redo();
  expect(model.valueOc.length).toBe(7);
  expect(model.valueOc[0]).toBe('0');
  expect(model.valueOc[1]).toBe('1');
  expect(model.valueOc[2]).toBe('2');
  expect(model.valueOc[3]).toBe('6');
  expect(model.valueOc[4]).toBe('7');
  expect(model.valueOc[5]).toBe('8');
  expect(model.valueOc[6]).toBe('9');
});

test('ObservableArray<T>.splice() deleteCount, items', () => {
  const history = new History();
  const model = new TestModel(history);

  model.valueOc.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  model.valueOc.splice(3, 3, 'A', 'B', 'C');
  expect(model.valueOc.length).toBe(10);
  expect(model.valueOc[0]).toBe('0');
  expect(model.valueOc[1]).toBe('1');
  expect(model.valueOc[2]).toBe('2');
  expect(model.valueOc[3]).toBe('A');
  expect(model.valueOc[4]).toBe('B');
  expect(model.valueOc[5]).toBe('C');
  expect(model.valueOc[6]).toBe('6');
  expect(model.valueOc[7]).toBe('7');
  expect(model.valueOc[8]).toBe('8');
  expect(model.valueOc[9]).toBe('9');

  history.undo();
  expect(model.valueOc.length).toBe(10);
  expect(model.valueOc[0]).toBe('0');
  expect(model.valueOc[1]).toBe('1');
  expect(model.valueOc[2]).toBe('2');
  expect(model.valueOc[3]).toBe('3');
  expect(model.valueOc[4]).toBe('4');
  expect(model.valueOc[5]).toBe('5');
  expect(model.valueOc[6]).toBe('6');
  expect(model.valueOc[7]).toBe('7');
  expect(model.valueOc[8]).toBe('8');
  expect(model.valueOc[9]).toBe('9');

  history.redo();
  expect(model.valueOc.length).toBe(10);
  expect(model.valueOc[0]).toBe('0');
  expect(model.valueOc[1]).toBe('1');
  expect(model.valueOc[2]).toBe('2');
  expect(model.valueOc[3]).toBe('A');
  expect(model.valueOc[4]).toBe('B');
  expect(model.valueOc[5]).toBe('C');
  expect(model.valueOc[6]).toBe('6');
  expect(model.valueOc[7]).toBe('7');
  expect(model.valueOc[8]).toBe('8');
  expect(model.valueOc[9]).toBe('9');
});

class TestModel implements NotifyPropertyChanged {
  readonly propertyChanged = new TypedEvent<PropertyChangedEventArgs>();

  valueOc = new ObservableArray<string>();

  constructor(history: History) {
    history.register(this);
  }
}
