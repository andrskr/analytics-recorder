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

export function useGetEventListeners() {
  return useContext(RecorderEventListenersContext);
}

export function RecorderEventsListener({ children, onEvent }: RecorderEventsListenerProps) {
  const parentGetListeners = useGetEventListeners();

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
