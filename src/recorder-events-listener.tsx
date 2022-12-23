import type { ReactNode, MutableRefObject } from 'react';
import { createContext, useContext, useLayoutEffect, useRef } from 'react';

import type { RecorderEvent } from './recorder-event';

export const CATCH_ALL_CHANNEL = Symbol('catch-all');
export type Channel = typeof CATCH_ALL_CHANNEL | string;

export type RecorderEventHandler = (recorderEvent: RecorderEvent) => void;
type ChannelAwareEventHandler = (recorderEvent: RecorderEvent, channel?: Channel) => void;

type RecorderEventsListenerProps = {
  children: ReactNode;
  onEvent: RecorderEventHandler;
  channel?: Channel;
};

export type GetEventHandlers = () => ChannelAwareEventHandler[];

const GetEventHandlersContext = createContext<
  MutableRefObject<GetEventHandlers | undefined> | undefined
>(undefined);
GetEventHandlersContext.displayName = 'GetContextValuesContext';

export function useGetEventHandlers() {
  return useContext(GetEventHandlersContext);
}

export function RecorderEventsListener({
  children,
  onEvent,
  channel,
}: RecorderEventsListenerProps) {
  const getHandlersRef = useRef<GetEventHandlers>();
  const parentGetHandlers = useGetEventHandlers();

  useLayoutEffect(() => {
    getHandlersRef.current = () => {
      const channelAwareHandler: ChannelAwareEventHandler = (recorderEvent, eventChannel?) => {
        if (channel === CATCH_ALL_CHANNEL || channel === eventChannel) {
          onEvent(recorderEvent);
        }
      };

      if (typeof parentGetHandlers?.current === 'function') {
        const parentHandlers = parentGetHandlers.current();

        return [...parentHandlers, channelAwareHandler];
      }

      return [channelAwareHandler];
    };
  }, [parentGetHandlers, onEvent, channel]);

  return (
    <GetEventHandlersContext.Provider value={getHandlersRef}>
      {children}
    </GetEventHandlersContext.Provider>
  );
}
