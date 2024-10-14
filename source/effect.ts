import { effectSubscribers } from './effect-subscribers.js';

export type Effect = () => void;
export type EffectSubscription = { subscribe: () => void; unsubscribe: () => void };
export type EffectSubscriber = { effect: Effect; subscription: EffectSubscription };

export function createEffect(effect: Effect): EffectSubscription {
  const subscription: EffectSubscription = {
    subscribe: () => void 0,
    unsubscribe: () => void 0,
  };

  const subscriber: EffectSubscriber = { effect, subscription };

  effectSubscribers.push(subscriber);

  try {
    subscriber.effect();
  } finally {
    effectSubscribers.pop();
  }

  return subscriber.subscription;
}
