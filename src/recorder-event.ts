import type { GetContextValues } from './recorder-events-context';
import type { Channel, GetEventHandlers } from './recorder-events-listener';

export type RecorderEventPayload = Record<string, unknown>;
type ContextValues = ReturnType<GetContextValues>;
type EventHandlers = ReturnType<GetEventHandlers>;

export class RecorderEvent {
  constructor(
    public payload: RecorderEventPayload,
    private eventHandlers?: EventHandlers,
    public context?: ContextValues,
  ) {}

  trigger(channel?: Channel) {
    this.eventHandlers?.forEach((currentHandler) => currentHandler(this, channel));
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
