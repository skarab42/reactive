import { effectSubscribers } from './effect-subscribers.js';

export type SignalChangeListener = () => void;
export type SignalSubscription = { subscribe: () => void; unsubscribe: () => void };

export type Signal<Value> = {
  (): Value;
  value(): Value;
  emit(value: Value): void;
  subscribe(listener: SignalChangeListener): SignalSubscription;
  unsubscribe(listener: SignalChangeListener): void;
  changeListenerCount(): number;
};

export function createSignal<Value>(value: Value): Signal<Value> {
  const changeListeners = new Set<SignalChangeListener>();

  function subscribe(listener: SignalChangeListener): SignalSubscription {
    const subscription = {
      subscribe: () => changeListeners.add(listener),
      unsubscribe: () => changeListeners.delete(listener),
    };

    subscription.subscribe();

    return subscription;
  }

  function signal(): Value {
    const lastIndex = effectSubscribers.length - 1;
    const subscriber = effectSubscribers[lastIndex];

    if (subscriber && !changeListeners.has(subscriber.effect)) {
      subscriber.subscription = subscribe(subscriber.effect);
    }

    return value;
  }

  signal.value = () => value;

  signal.subscribe = subscribe;

  signal.unsubscribe = (listener: SignalChangeListener) => {
    changeListeners.delete(listener);
  };

  signal.changeListenerCount = () => changeListeners.size;

  signal.emit = (newValue: Value) => {
    if (value !== newValue) {
      value = newValue;

      for (const listener of changeListeners) {
        listener();
      }
    }
  };

  return signal;
}
