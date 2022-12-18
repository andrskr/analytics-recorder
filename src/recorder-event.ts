import type { RecorderEventContextValue } from './recorder-events-context';
import type { GetRecorderEventHandlers } from './recorder-events-listener';

export type RecorderEventPayload = Record<string, unknown>;
export class RecorderEvent {
  constructor(
    public payload: RecorderEventPayload,
    private getListeners?: GetRecorderEventHandlers,
    public context?: Set<RecorderEventContextValue>,
  ) {}

  trigger() {
    this.getListeners?.().forEach((currentHandler) => currentHandler(this));
  }
}
