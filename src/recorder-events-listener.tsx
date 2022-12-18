import type { RecorderEvent } from './recorder-event';
import { treePropCollector } from './tree-prop-collector';

type RecorderEventHandler = (recorderEvent: RecorderEvent) => void;

export const [RecorderEventsListener, useGetEventListeners] =
  treePropCollector<RecorderEventHandler>('RecorderEventListenerContext');
