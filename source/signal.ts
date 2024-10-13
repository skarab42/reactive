export type ChangeListener = () => void;

export type Signal<Value> = {
  (): Value;
  value(): Value;
  emit(value: Value): void;
  subscribe(listener: ChangeListener): void;
};

export function createSignal<Value>(value: Value): Signal<Value> {
  const changeListeners = new Set<ChangeListener>();

  function signal(): Value {
    return value;
  }

  signal.value = () => value;

  signal.subscribe = (listener: ChangeListener) => {
    changeListeners.add(listener);
  };

  signal.emit = (newValue: Value) => {
    if (value !== newValue) {
      value = newValue;

      for (const effect of changeListeners) {
        effect();
      }
    }
  };

  return signal;
}
