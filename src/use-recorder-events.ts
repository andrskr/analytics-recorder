import { useCallback } from 'react';

import type { RecorderEventPayload } from './recorder-event';
import { RecorderEvent } from './recorder-event';
import { useGetContextValues } from './recorder-events-context';
import { useHandlersRegistry } from './recorder-events-listener';

export function useRecorderEvents() {
  const handlersRegistry = useHandlersRegistry();
  const getContextValues = useGetContextValues();

  return useCallback(
    function createRecorderEvent(payload: RecorderEventPayload) {
      return new RecorderEvent(payload, handlersRegistry?.handlers, getContextValues?.());
    },
    [handlersRegistry, getContextValues],
  );
}

export type RecorderEvents = ReturnType<typeof useRecorderEvents>;
