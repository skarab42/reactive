import { effectSubscribers } from './effect-subscribers.js';

export type Effect = () => void;
export type EffectSubscription = { subscribe: () => void; unsubscribe: () => void };
export type EffectSubscriber = { effect: Effect; subscriptions: EffectSubscription[] };

export function createEffect(effect: Effect): EffectSubscription {
  const subscriber: EffectSubscriber = { effect, subscriptions: [] };

  effectSubscribers.push(subscriber);

  try {
    subscriber.effect();

    const parentIndex = effectSubscribers.length - 2;
    const parentSubscriber = effectSubscribers[parentIndex];

    if (parentSubscriber) {
      parentSubscriber.subscriptions.push(...subscriber.subscriptions);
    }
  } finally {
    effectSubscribers.pop();
  }

  return {
    subscribe: () => {
      for (const subscription of subscriber.subscriptions) {
        subscription.subscribe();
      }
    },
    unsubscribe: () => {
      for (const subscription of subscriber.subscriptions) {
        subscription.unsubscribe();
      }
    },
  };
}
