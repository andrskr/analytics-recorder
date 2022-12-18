import { useCallback } from 'react';

import type { RecorderEventPayload } from './recorder-event';
import { RecorderEvent } from './recorder-event';
import { useRecorderEventContextValues } from './recorder-events-context';
import { useRecorderEventListeners } from './recorder-events-listener';

export function useRecorderEvents() {
  const getListeners = useRecorderEventListeners();
  const getContextValues = useRecorderEventContextValues();

  return useCallback(
    function createRecorderEvent(payload: RecorderEventPayload) {
      return new RecorderEvent(payload, getListeners, getContextValues);
    },
    [getListeners, getContextValues],
  );
}

export type RecorderEvents = ReturnType<typeof useRecorderEvents>;
