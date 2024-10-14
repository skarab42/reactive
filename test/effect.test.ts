import { expect, it, vi } from 'vitest';

import { createEffect, createSignal } from '../source/index.js';

it('should call effect when signal emit new value', () => {
  const signal = createSignal(0);
  const log = vi.fn();

  createEffect(() => {
    log(signal());
  });

  expect(log).toHaveBeenLastCalledWith(0);

  signal.emit(1);
  expect(log).toHaveBeenLastCalledWith(1);

  signal.emit(2);
  signal.emit(2);
  signal.emit(2);
  expect(log).toHaveBeenLastCalledWith(2);

  expect(log).toHaveBeenCalledTimes(3);
});

it('should call effect when any signal emit new value', () => {
  const signal1 = createSignal(0);
  const signal2 = createSignal(0);
  const log = vi.fn();

  createEffect(() => {
    log(signal1(), signal2());
  });

  expect(log).toHaveBeenLastCalledWith(0, 0);

  signal1.emit(1);
  signal1.emit(1);
  signal1.emit(1);
  expect(log).toHaveBeenLastCalledWith(1, 0);

  signal2.emit(1);
  signal2.emit(1);
  signal2.emit(1);
  expect(log).toHaveBeenLastCalledWith(1, 1);

  expect(log).toHaveBeenCalledTimes(3);
});

it('should not call effect when signal is accessed by value method', () => {
  const signal1 = createSignal(0);
  const signal2 = createSignal(0);
  const log = vi.fn();

  createEffect(() => {
    log(signal1(), signal2.value());
  });

  expect(log).toHaveBeenLastCalledWith(0, 0);

  signal1.emit(1);
  expect(log).toHaveBeenLastCalledWith(1, 0);

  // signal2 is accessed by value method,
  // the effect should not be called,
  // but the value should be updated
  signal2.emit(1);
  expect(signal2.value()).toBe(1);

  signal1.emit(2);
  expect(log).toHaveBeenLastCalledWith(2, 1);

  expect(log).toHaveBeenCalledTimes(3);
});

it('should unsubscribe and re-subscribe from/to effect', () => {
  const signal = createSignal(0);
  const log = vi.fn();

  const { unsubscribe, subscribe } = createEffect(() => {
    log(signal());
  });

  expect(log).toHaveBeenLastCalledWith(0);

  signal.emit(1);
  expect(log).toHaveBeenLastCalledWith(1);

  signal.emit(2);
  expect(log).toHaveBeenLastCalledWith(2);

  unsubscribe();

  signal.emit(3);
  signal.emit(4);
  signal.emit(5);

  subscribe();

  signal.emit(6);
  expect(log).toHaveBeenLastCalledWith(6);

  signal.emit(7);
  expect(log).toHaveBeenLastCalledWith(7);

  signal.emit(8);
  expect(log).toHaveBeenLastCalledWith(8);

  expect(log).toHaveBeenCalledTimes(6);
});
