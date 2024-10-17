import { expect, it, vi } from 'vitest';

import { createEffect, createSignal, type Effect } from '../source/index.js';

it('should call nested effects', () => {
  const rootSignal = createSignal(0);
  const level1Signal = createSignal(0);
  const level2Signal = createSignal(0);

  const setRoot = vi.fn();
  const setLevel1 = vi.fn();
  const setLevel2 = vi.fn();

  const level2Effect: Effect = () => {
    setLevel2(`root: ${rootSignal.value()} | level-1: ${level1Signal.value()} | level-2: ${level2Signal()}`);
  };

  const level1Effect: Effect = () => {
    setLevel1(`root: ${rootSignal.value()} | level-1: ${level1Signal()}`);
    createEffect(level2Effect);
  };

  const rootEffect: Effect = () => {
    setRoot(`root: ${rootSignal()}`);
    createEffect(level1Effect);
  };

  createEffect(rootEffect);

  expect(setRoot).toHaveBeenCalledTimes(1);
  expect(setRoot).toHaveBeenLastCalledWith('root: 0');
  expect(setLevel1).toHaveBeenCalledTimes(1);
  expect(setLevel1).toHaveBeenLastCalledWith('root: 0 | level-1: 0');
  expect(setLevel2).toHaveBeenCalledTimes(1);
  expect(setLevel2).toHaveBeenLastCalledWith('root: 0 | level-1: 0 | level-2: 0');

  // should call all effects when root signal change
  rootSignal.emit(rootSignal.value() + 1);

  expect(setRoot).toHaveBeenCalledTimes(2);
  expect(setRoot).toHaveBeenLastCalledWith('root: 1');
  expect(setLevel1).toHaveBeenCalledTimes(2);
  expect(setLevel1).toHaveBeenLastCalledWith('root: 1 | level-1: 0');
  expect(setLevel2).toHaveBeenCalledTimes(2);
  expect(setLevel2).toHaveBeenLastCalledWith('root: 1 | level-1: 0 | level-2: 0');

  // should call both level 1 and 2 effects if level 1 signal change
  level1Signal.emit(level1Signal.value() + 1);

  expect(setRoot).toHaveBeenCalledTimes(2);
  expect(setRoot).toHaveBeenLastCalledWith('root: 1');
  expect(setLevel1).toHaveBeenCalledTimes(3);
  expect(setLevel1).toHaveBeenLastCalledWith('root: 1 | level-1: 1');
  expect(setLevel2).toHaveBeenCalledTimes(3);
  expect(setLevel2).toHaveBeenLastCalledWith('root: 1 | level-1: 1 | level-2: 0');

  // should only call level 2 effect if level 2 signal change
  level2Signal.emit(level2Signal.value() + 1);

  expect(setRoot).toHaveBeenCalledTimes(2);
  expect(setRoot).toHaveBeenLastCalledWith('root: 1');
  expect(setLevel1).toHaveBeenCalledTimes(3);
  expect(setLevel1).toHaveBeenLastCalledWith('root: 1 | level-1: 1');
  expect(setLevel2).toHaveBeenCalledTimes(4);
  expect(setLevel2).toHaveBeenLastCalledWith('root: 1 | level-1: 1 | level-2: 1');
});

it('should not loop indefinitely when signals are used recursively', () => {
  const headSignal = createSignal(0);
  const tailSignal = createSignal(0);

  const setHead = vi.fn();
  const setTail = vi.fn();

  const tailEffect: Effect = () => {
    setTail(`head: ${headSignal()} | tail: ${tailSignal()}`);
  };

  const headEffect: Effect = () => {
    setHead(`head: ${headSignal()} | tail: ${tailSignal()}`);
    createEffect(tailEffect);
  };

  createEffect(headEffect);

  expect(setHead).toHaveBeenCalledTimes(1);
  expect(setHead).toHaveBeenLastCalledWith('head: 0 | tail: 0');
  expect(setTail).toHaveBeenCalledTimes(1);
  expect(setTail).toHaveBeenLastCalledWith('head: 0 | tail: 0');

  headSignal.emit(headSignal.value() + 1);

  expect(setHead).toHaveBeenCalledTimes(2);
  expect(setHead).toHaveBeenLastCalledWith('head: 1 | tail: 0');
  expect(setTail).toHaveBeenCalledTimes(3);
  expect(setTail).toHaveBeenLastCalledWith('head: 1 | tail: 0');

  tailSignal.emit(tailSignal.value() + 1);

  expect(setHead).toHaveBeenCalledTimes(3);
  expect(setHead).toHaveBeenLastCalledWith('head: 1 | tail: 1');
  expect(setTail).toHaveBeenCalledTimes(5);
  expect(setTail).toHaveBeenLastCalledWith('head: 1 | tail: 1');
});

it('should unsubscribe from nested effect', () => {
  const headSignal = createSignal(0);
  const bodySignal = createSignal(0);
  const tailSignal = createSignal(0);

  const setHead = vi.fn();
  const setBody = vi.fn();
  const setTail = vi.fn();

  const tailEffect: Effect = () => {
    setTail(`head: ${headSignal.value()} | body: ${bodySignal.value()} | tail: ${tailSignal()}`);
  };

  const bodyEffect: Effect = () => {
    setBody(`head: ${headSignal.value()} | body: ${bodySignal()} | tail: ${tailSignal.value()}`);
    createEffect(tailEffect);
  };

  const headEffect: Effect = () => {
    setHead(`head: ${headSignal()} | body: ${bodySignal.value()} | tail: ${tailSignal.value()}`);
    createEffect(bodyEffect);
  };

  const { unsubscribe } = createEffect(headEffect);

  expect(setHead).toHaveBeenCalledTimes(1);
  expect(setBody).toHaveBeenCalledTimes(1);
  expect(setTail).toHaveBeenCalledTimes(1);

  headSignal.emit(headSignal.value() + 1);

  expect(setHead).toHaveBeenCalledTimes(2);
  expect(setBody).toHaveBeenCalledTimes(2);
  expect(setTail).toHaveBeenCalledTimes(2);

  unsubscribe();

  headSignal.emit(headSignal.value() + 1);

  expect(setHead).toHaveBeenCalledTimes(2);
  expect(setBody).toHaveBeenCalledTimes(2);
  expect(setTail).toHaveBeenCalledTimes(2);

  // should unsubscribe child effects
  headSignal.emit(headSignal.value() + 1);
  bodySignal.emit(bodySignal.value() + 1);
  tailSignal.emit(tailSignal.value() + 1);

  expect(setHead).toHaveBeenCalledTimes(2);
  expect(setBody).toHaveBeenCalledTimes(2);
  expect(setTail).toHaveBeenCalledTimes(2);
});
