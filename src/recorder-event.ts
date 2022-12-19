import type { GetContextValues } from './recorder-events-context';
import type { GetRecorderEventHandlers } from './recorder-events-listener';

export type RecorderEventPayload = Record<string, unknown>;
export type Channel = '*' | string;

export class RecorderEvent {
  constructor(
    public payload: RecorderEventPayload,
    private getListeners?: GetRecorderEventHandlers,
    public getContext?: GetContextValues,
  ) {}

  trigger(channel?: Channel) {
    this.getListeners?.().forEach((currentHandler) => currentHandler(this, channel));
  }
}
