import { useCallback } from 'react';

import type { RecorderEventPayload } from './recorder-event';
import { RecorderEvent } from './recorder-event';
import { useEventsContext } from './recorder-events-context';
import { useRecorderEventListeners } from './recorder-events-listener';

export function useRecorderEvents() {
  const getListeners = useRecorderEventListeners();
  const eventsContext = useEventsContext();

  return useCallback(
    function createRecorderEvent(payload: RecorderEventPayload) {
      return new RecorderEvent(payload, getListeners, eventsContext?.context);
    },
    [getListeners, eventsContext],
  );
}

export type RecorderEvents = ReturnType<typeof useRecorderEvents>;
