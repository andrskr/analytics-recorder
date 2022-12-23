import type { GetContextValues } from './recorder-events-context';
import type { Channel, useHandlersRegistry } from './recorder-events-listener';

export type RecorderEventPayload = Record<string, unknown>;

type EventHandlers = NonNullable<ReturnType<typeof useHandlersRegistry>>['handlers'];

export class RecorderEvent {
  constructor(
    public payload: RecorderEventPayload,
    private listeners?: EventHandlers,
    public context?: ReturnType<GetContextValues>,
  ) {}

  trigger(channel?: Channel) {
    this.listeners?.forEach((currentHandler) => currentHandler(this, channel));
  }

  update(next: RecorderEventPayload | ((previous: RecorderEventPayload) => RecorderEventPayload)) {
    if (typeof next === 'function') {
      this.payload = next(this.payload);
    } else {
      this.payload = {
        ...this.payload,
        ...next,
      };
    }

    return this;
  }
}
