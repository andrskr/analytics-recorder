import { useMemo } from 'react';

import type { RecorderEvent, RecorderEventPayload } from './recorder-event';
import { useRecorderEvents } from './use-recorder-events';

type ExcludeRecorderEvent<TParams extends unknown[]> = TParams extends [
  ...fist: infer TFirst,
  last: infer TLast,
]
  ? TLast extends RecorderEvent
    ? [...first: TFirst]
    : TParams
  : TParams;

export function useRecorderEventsCallback<TParams extends unknown[], TReturnValue>(
  callback: (...args: [...first: TParams, recorderEvent: RecorderEvent]) => TReturnValue,
  recorderEventPayload: RecorderEventPayload,
) {
  const createRecorderEvent = useRecorderEvents();

  return useMemo(() => {
    return new Proxy(callback, {
      apply(targetFn, thisArg, argArray) {
        const recorderEvent = createRecorderEvent(recorderEventPayload);

        return Reflect.apply(targetFn, thisArg, [...argArray, recorderEvent]);
      },
    }) as (
      ...args: ExcludeRecorderEvent<Parameters<typeof callback>>
    ) => ReturnType<typeof callback>;
  }, [callback, createRecorderEvent, recorderEventPayload]);
}
