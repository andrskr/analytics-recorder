import type { ReactNode } from 'react';
import { createContext, useContext, useLayoutEffect, useState } from 'react';

import type { RecorderEvent } from './recorder-event';

type RecorderEventsHandler = (recorderEvent: RecorderEvent) => void;

type RecorderEventsListenerProps = {
  children: ReactNode;
  onEvent: RecorderEventsHandler;
};
function createRecorderEventListeners() {
  const subscribers = new Set<RecorderEventsHandler>();

  const subscribe = (subscriber: RecorderEventsHandler) => {
    subscribers.add(subscriber);

    return () => {
      subscribers.delete(subscriber);
    };
  };

  const emit = (recorderEvent: RecorderEvent) => {
    subscribers.forEach((currentSubscriber) => currentSubscriber(recorderEvent));
  };

  return { subscribe, emit };
}

export type RecorderEventListeners = ReturnType<typeof createRecorderEventListeners>;

const RecorderEventListenersContext = createContext<RecorderEventListeners | undefined>(undefined);
RecorderEventListenersContext.displayName = 'RecorderEventListenersContext';

type RecorderEventListenersProps = {
  children: ReactNode;
};

function RecorderEventListeners({ children }: RecorderEventListenersProps) {
  const [recorderEvents] = useState(() => createRecorderEventListeners());

  return (
    <RecorderEventListenersContext.Provider value={recorderEvents}>
      {children}
    </RecorderEventListenersContext.Provider>
  );
}

export function useRecorderEventListeners() {
  return useContext(RecorderEventListenersContext);
}

function RecorderEventsSubscriber({ onEvent, children }: RecorderEventsListenerProps) {
  const recorderEvents = useRecorderEventListeners();

  if (typeof recorderEvents === 'undefined') {
    throw new Error(
      'RecorderEventsSubscriber must be used within RecorderEventListenersContext.Provider',
    );
  }

  useLayoutEffect(() => {
    return recorderEvents.subscribe(onEvent);
  }, [onEvent, recorderEvents]);

  return children as JSX.Element;
}

export function RecorderEventsListener({ children, onEvent }: RecorderEventsListenerProps) {
  // const id = useId();

  // 1 - basic (context value changed every rerender)
  // const parentEvent = useRecorderEventsListener();
  // const value = [...parentEvent ?? [], onEvent]

  // 2 - callback (context value changed only when either parent callback or current onEvent changed)
  // const parentGetListeners = useRecorderEventsListener();
  //
  // const getListeners = useCallback(() => {
  //   if (typeof parentGetListeners === 'function') {
  //     const parentListeners = parentGetListeners();
  //
  //     return [...parentListeners, onEvent];
  //   }
  //
  //   return [onEvent];
  // }, [onEvent, parentGetListeners]);

  // 3 - pub/sub

  const listeners = useRecorderEventListeners();

  if (typeof listeners === 'undefined') {
    return (
      <RecorderEventListeners>
        <RecorderEventsSubscriber onEvent={onEvent}>{children}</RecorderEventsSubscriber>
      </RecorderEventListeners>
    );
  }

  return <RecorderEventsSubscriber onEvent={onEvent}>{children}</RecorderEventsSubscriber>;
}
