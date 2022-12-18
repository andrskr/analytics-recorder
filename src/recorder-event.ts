import type { RecorderEventContextValue } from './recorder-events-context';
import type { RecorderEventListeners } from './recorder-events-listener';

export type RecorderEventPayload = Record<string, unknown>;
export class RecorderEvent {
  constructor(
    public payload: RecorderEventPayload,
    private listeners?: RecorderEventListeners,
    public context?: Set<RecorderEventContextValue>,
  ) {}

  trigger() {
    this.listeners?.emit(this);
  }
}
