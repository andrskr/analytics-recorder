import { useCallback } from 'react';

import type { RecorderEventPayload } from './recorder-event';
import { RecorderEvent } from './recorder-event';
import { useGetContextValues } from './recorder-events-context';
import { useGetEventListeners } from './recorder-events-listener';

export function useRecorderEvents() {
  const getListeners = useGetEventListeners();
  const getContextValues = useGetContextValues();

  return useCallback(
    function createRecorderEvent(payload: RecorderEventPayload) {
      return new RecorderEvent(payload, getListeners?.(), getContextValues?.());
    },
    [getListeners, getContextValues],
  );
}

export type RecorderEvents = ReturnType<typeof useRecorderEvents>;
