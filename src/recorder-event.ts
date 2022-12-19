import type { GetContextValues } from './recorder-events-context';
import type { GetRecorderEventHandlers } from './recorder-events-listener';

export type RecorderEventPayload = Record<string, unknown>;

export class RecorderEvent {
  constructor(
    public payload: RecorderEventPayload,
    private getListeners?: GetRecorderEventHandlers,
    public getContext?: GetContextValues,
  ) {}

  trigger() {
    this.getListeners?.().forEach((currentHandler) => currentHandler(this));
  }
}
