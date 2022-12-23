import { useCallback } from 'react';

import type { RecorderEventPayload } from './recorder-event';
import { RecorderEvent } from './recorder-event';
import { useGetContextValues } from './recorder-events-context';
import { useGetEventHandlers } from './recorder-events-listener';

export function useRecorderEvents() {
  const getEventHandlers = useGetEventHandlers();
  const getContextValues = useGetContextValues();

  return useCallback(
    function createRecorderEvent(payload: RecorderEventPayload) {
      return new RecorderEvent(
        payload,
        getEventHandlers?.current?.(),
        getContextValues?.current?.(),
      );
    },
    [getEventHandlers, getContextValues],
  );
}

export type RecorderEvents = ReturnType<typeof useRecorderEvents>;
