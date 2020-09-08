import { ObservableArray } from '../src/ObservableArray';
import createMirroringArray from '../src/MirroringArray';
test('initial', () => {
  const source = new ObservableArray<string>();

  source.push('A', 'B', 'C', 'D');

  const target = createMirroringArray<string>(source);

  expect(target.length).toBe(4);
  expect(target[0]).toBe('A');
  expect(target[1]).toBe('B');
  expect(target[2]).toBe('C');
  expect(target[3]).toBe('D');

  target.dispose();
});

test('push()', () => {
  const source = new ObservableArray<string>();
  const target = createMirroringArray<string>(source);

  source.push('A', 'B', 'C', 'D');

  expect(target.length).toBe(4);
  expect(target[0]).toBe('A');
  expect(target[1]).toBe('B');
  expect(target[2]).toBe('C');
  expect(target[3]).toBe('D');

  target.dispose();
});

test('pop()', () => {
  const source = new ObservableArray<string>();
  const target = createMirroringArray<string>(source);

  source.push('A', 'B', 'C', 'D');

  expect(target.length).toBe(4);
  expect(target[0]).toBe('A');
  expect(target[1]).toBe('B');
  expect(target[2]).toBe('C');
  expect(target[3]).toBe('D');

  source.pop();

  expect(target.length).toBe(3);
  expect(target[0]).toBe('A');
  expect(target[1]).toBe('B');
  expect(target[2]).toBe('C');

  target.dispose();
});

test('shift()', () => {
  const source = new ObservableArray<string>();
  const target = createMirroringArray<string>(source);

  source.push('A', 'B', 'C', 'D');

  expect(target.length).toBe(4);
  expect(target[0]).toBe('A');
  expect(target[1]).toBe('B');
  expect(target[2]).toBe('C');
  expect(target[3]).toBe('D');

  source.shift();

  expect(target.length).toBe(3);
  expect(target[0]).toBe('B');
  expect(target[1]).toBe('C');
  expect(target[2]).toBe('D');

  target.dispose();
});

test('unshift()', () => {
  const source = new ObservableArray<string>();
  const target = createMirroringArray<string>(source);

  source.push('A', 'B', 'C', 'D');

  expect(target.length).toBe(4);
  expect(target[0]).toBe('A');
  expect(target[1]).toBe('B');
  expect(target[2]).toBe('C');
  expect(target[3]).toBe('D');

  source.unshift('X', 'Y');

  expect(target.length).toBe(6);
  expect(target[0]).toBe('X');
  expect(target[1]).toBe('Y');
  expect(target[2]).toBe('A');
  expect(target[3]).toBe('B');
  expect(target[4]).toBe('C');
  expect(target[5]).toBe('D');

  target.dispose();
});

test('sort()', () => {
  const source = new ObservableArray<string>();
  const target = createMirroringArray<string>(source);

  source.push('9', '8', '7', '6', '5', '4', '3', '2', '1', '0');

  source.sort();

  expect(target.length).toBe(10);
  expect(target[0]).toBe('0');
  expect(target[1]).toBe('1');
  expect(target[2]).toBe('2');
  expect(target[3]).toBe('3');
  expect(target[4]).toBe('4');
  expect(target[5]).toBe('5');
  expect(target[6]).toBe('6');
  expect(target[7]).toBe('7');
  expect(target[8]).toBe('8');
  expect(target[9]).toBe('9');

  target.dispose();
});

test('reverse()', () => {
  const source = new ObservableArray<string>();
  const target = createMirroringArray<string>(source);

  source.push('9', '8', '7', '6', '5', '4', '3', '2', '1', '0');

  source.reverse();

  expect(target.length).toBe(10);
  expect(target[0]).toBe('0');
  expect(target[1]).toBe('1');
  expect(target[2]).toBe('2');
  expect(target[3]).toBe('3');
  expect(target[4]).toBe('4');
  expect(target[5]).toBe('5');
  expect(target[6]).toBe('6');
  expect(target[7]).toBe('7');
  expect(target[8]).toBe('8');
  expect(target[9]).toBe('9');

  target.dispose();
});

test('splice() deleteCount is null', () => {
  const source = new ObservableArray<string>();
  const target = createMirroringArray<string>(source);

  source.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  source.splice(3);

  expect(target.length).toBe(3);
  expect(target[0]).toBe('0');
  expect(target[1]).toBe('1');
  expect(target[2]).toBe('2');

  target.dispose();
});

test('splice() deleteCount is not null', () => {
  const source = new ObservableArray<string>();
  const target = createMirroringArray<string>(source);

  source.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  target.splice(3, 3);

  expect(target.length).toBe(7);
  expect(target[0]).toBe('0');
  expect(target[1]).toBe('1');
  expect(target[2]).toBe('2');
  expect(target[3]).toBe('6');
  expect(target[4]).toBe('7');
  expect(target[5]).toBe('8');
  expect(target[6]).toBe('9');

  target.dispose();
});

test('splice() deleteCount, items', () => {
  const source = new ObservableArray<string>();
  const target = createMirroringArray<string>(source);

  source.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  target.splice(3, 3, 'A', 'B', 'C');

  expect(target.length).toBe(10);
  expect(target[0]).toBe('0');
  expect(target[1]).toBe('1');
  expect(target[2]).toBe('2');
  expect(target[3]).toBe('A');
  expect(target[4]).toBe('B');
  expect(target[5]).toBe('C');
  expect(target[6]).toBe('6');
  expect(target[7]).toBe('7');
  expect(target[8]).toBe('8');
  expect(target[9]).toBe('9');

  target.dispose();
});
