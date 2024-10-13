import { expect, it, vi } from 'vitest';

import { createSignal } from '../source/index.js';

it('should return signal value when used as function', () => {
  const signal = createSignal(42);

  expect(signal()).toStrictEqual(42);
});

it('should return signal value when value method is used', () => {
  const signal = createSignal(42);

  expect(signal.value()).toStrictEqual(42);
});

it('should emit value change event', () => {
  const signal = createSignal(42);

  signal.emit(10_402);

  expect(signal()).toStrictEqual(10_402);
  expect(signal.value()).toStrictEqual(10_402);
});

it('should subscribe to value change', () => {
  const emittedValues: number[] = [];
  const signal = createSignal(0);
  const onChange = vi.fn().mockImplementation(() => {
    emittedValues.push(signal());
  });

  signal.subscribe(onChange);

  signal.emit(1); // + 1 call
  signal.emit(2); // + 1 call
  signal.emit(2); // noop, no value change
  signal.emit(2); // noop, no value change
  signal.emit(3); // + 1 call
  signal.emit(3); // noop, no value change

  expect(onChange).toHaveBeenCalledTimes(3);
  expect(emittedValues).toStrictEqual([1, 2, 3]);
});

it('should unsubscribe from subscription', () => {
  const emittedValues: number[] = [];
  const signal = createSignal(0);
  const onChange = vi.fn().mockImplementation(() => {
    emittedValues.push(signal());
  });

  const { unsubscribe } = signal.subscribe(onChange);

  signal.emit(1);
  signal.emit(2);
  signal.emit(3);

  unsubscribe();

  signal.emit(4);
  signal.emit(5);
  signal.emit(6);

  expect(signal()).toStrictEqual(6);
  expect(onChange).toHaveBeenCalledTimes(3);
  expect(emittedValues).toStrictEqual([1, 2, 3]);
});

it('should unsubscribe from value change', () => {
  const emittedValues: number[] = [];
  const signal = createSignal(0);
  const onChange = vi.fn().mockImplementation(() => {
    emittedValues.push(signal());
  });

  signal.subscribe(onChange);

  signal.emit(1);
  signal.emit(2);
  signal.emit(3);

  signal.unsubscribe(onChange);

  signal.emit(4);
  signal.emit(5);
  signal.emit(6);

  expect(signal()).toStrictEqual(6);
  expect(onChange).toHaveBeenCalledTimes(3);
  expect(emittedValues).toStrictEqual([1, 2, 3]);
});

it('should re-subscribe after unsubscribed from value change', () => {
  const emittedValues: number[] = [];
  const signal = createSignal(0);
  const onChange = vi.fn().mockImplementation(() => {
    emittedValues.push(signal());
  });

  const { subscribe, unsubscribe } = signal.subscribe(onChange);

  signal.emit(1);
  signal.emit(2);
  signal.emit(3);

  unsubscribe();

  signal.emit(4);
  signal.emit(5);
  signal.emit(6);

  subscribe();

  signal.emit(100);
  signal.emit(200);
  signal.emit(300);

  expect(signal()).toStrictEqual(300);
  expect(onChange).toHaveBeenCalledTimes(6);
  expect(emittedValues).toStrictEqual([1, 2, 3, 100, 200, 300]);
});

it('should not subscribe multiple times to value change with the same listener instance', () => {
  const signal = createSignal(0);
  const onChange1 = vi.fn();
  const onChange2 = vi.fn();

  const { subscribe: subscribe1 } = signal.subscribe(onChange1);
  signal.subscribe(onChange1);
  signal.subscribe(onChange1);
  subscribe1();
  subscribe1();

  expect(signal.changeListenerCount()).toStrictEqual(1);

  const { subscribe: subscribe2 } = signal.subscribe(onChange2);
  signal.subscribe(onChange2);
  signal.subscribe(onChange2);
  subscribe2();
  subscribe2();

  expect(signal.changeListenerCount()).toStrictEqual(2);
});
