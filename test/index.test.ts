import { expect, it, vi } from 'vitest';

import { createSignal } from '../source/index.js';

it('should return signal value when used as function', () => {
  const signal = createSignal(42);

  expect(signal()).toBe(42);
});

it('should return signal value when value method is used', () => {
  const signal = createSignal(42);

  expect(signal.value()).toBe(42);
});

it('should emit new value event', () => {
  const signal = createSignal(42);
  const newValue = 10_402;

  signal.emit(newValue);

  expect(signal()).toBe(newValue);
  expect(signal.value()).toBe(newValue);
});

it('should subscribe to value change emission event', () => {
  const signal = createSignal(0);
  const effect = vi.fn();

  signal.subscribe(effect);

  signal.emit(10); // + 1 call
  signal.emit(200); // + 1 call
  signal.emit(200); // noop, no value change
  signal.emit(200); // noop, no value change
  signal.emit(3000); // + 1 call
  signal.emit(3000); // noop, no value change

  expect(effect).toHaveBeenCalledTimes(3);
});
