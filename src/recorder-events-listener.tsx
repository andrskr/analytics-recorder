import type { ReactNode } from 'react';
import { createContext, useCallback, useContext } from 'react';

import type { RecorderEvent } from './recorder-event';

type RecorderEventHandler = (recorderEvent: RecorderEvent) => void;

type RecorderEventsListenerProps = {
  children: ReactNode;
  onEvent: RecorderEventHandler;
};

export type GetRecorderEventHandlers = () => RecorderEventHandler[];

const RecorderEventListenersContext = createContext<GetRecorderEventHandlers | undefined>(
  undefined,
);
RecorderEventListenersContext.displayName = 'RecorderEventListenersContext';

export function useRecorderEventListeners() {
  return useContext(RecorderEventListenersContext);
}

export function RecorderEventsListener({ children, onEvent }: RecorderEventsListenerProps) {
  // 1 - basic (context value changed every rerender)
  // const parentEvent = useRecorderEventsListener();
  // const value = [...parentEvent ?? [], onEvent]
  // 2 - callback (context value changed only when either parent callback or current onEvent changed)
  // 3 - pub/sub

  const parentGetListeners = useRecorderEventListeners();

  const getListeners = useCallback(() => {
    if (typeof parentGetListeners === 'function') {
      const parentListeners = parentGetListeners();

      return [...parentListeners, onEvent];
    }

    return [onEvent];
  }, [onEvent, parentGetListeners]);

  return (
    <RecorderEventListenersContext.Provider value={getListeners}>
      {children}
    </RecorderEventListenersContext.Provider>
  );
}
