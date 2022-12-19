import type { ReactNode } from 'react';
import { createContext, useCallback, useContext } from 'react';

import type { Channel, RecorderEvent } from './recorder-event';

type RecorderEventHandler = (recorderEvent: RecorderEvent) => void;
type ChannelAwareEventHandler = (recorderEvent: RecorderEvent, channel?: Channel) => void;

type RecorderEventsListenerProps = {
  children: ReactNode;
  onEvent: RecorderEventHandler;
  channel?: Channel;
};

export type GetRecorderEventHandlers = () => ChannelAwareEventHandler[];

const RecorderEventListenersContext = createContext<GetRecorderEventHandlers | undefined>(
  undefined,
);
RecorderEventListenersContext.displayName = 'RecorderEventListenersContext';

export function useGetEventListeners() {
  return useContext(RecorderEventListenersContext);
}

export function RecorderEventsListener({
  children,
  onEvent,
  channel,
}: RecorderEventsListenerProps) {
  const parentGetListeners = useGetEventListeners();

  const getListeners = useCallback(() => {
    const actualEventHandler = (recorderEvent: RecorderEvent, eventChannel?: Channel) => {
      if (channel === '*' || channel === eventChannel) {
        onEvent(recorderEvent);
      }
    };

    if (typeof parentGetListeners === 'function') {
      const parentListeners = parentGetListeners();

      return [...parentListeners, actualEventHandler];
    }

    return [actualEventHandler];
  }, [channel, onEvent, parentGetListeners]);

  return (
    <RecorderEventListenersContext.Provider value={getListeners}>
      {children}
    </RecorderEventListenersContext.Provider>
  );
}
