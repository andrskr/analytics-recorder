import type { ReactNode } from 'react';
import { createContext, useContext, useLayoutEffect, useState } from 'react';

export type RecorderEventContextValue = Record<string, unknown>;

type RecorderEventsContextProps = {
  children: ReactNode;
  value: RecorderEventContextValue;
};

function createEventsContext() {
  const context = new Set<RecorderEventContextValue>();

  const addValue = (value: RecorderEventContextValue) => {
    context.add(value);

    return () => {
      context.delete(value);
    };
  };

  return { context, addValue };
}

type RecorderEventsContext = ReturnType<typeof createEventsContext>;

const EventsContext = createContext<RecorderEventsContext | undefined>(undefined);

export function useEventsContext() {
  return useContext(EventsContext);
}

type ContextProviderProps = {
  children: ReactNode;
};

function ContextProvider({ children }: ContextProviderProps) {
  const [context] = useState(() => createEventsContext());

  return <EventsContext.Provider value={context}>{children}</EventsContext.Provider>;
}

function ContextSubscriber({ value, children }: RecorderEventsContextProps) {
  const context = useEventsContext();

  if (typeof context === 'undefined') {
    throw new Error('ContextSubscriber must be used within EventsContext.Provider');
  }

  useLayoutEffect(() => {
    return context.addValue(value);
  }, [context, value]);

  return children as JSX.Element;
}

export function RecorderEventsContext({ value, children }: RecorderEventsContextProps) {
  const context = useEventsContext();

  if (typeof context === 'undefined') {
    return (
      <ContextProvider>
        <ContextSubscriber value={value}>{children}</ContextSubscriber>
      </ContextProvider>
    );
  }

  return <ContextSubscriber value={value}>{children}</ContextSubscriber>;
}
