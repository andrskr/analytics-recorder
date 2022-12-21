import type { ReactNode } from 'react';
import { createContext, useCallback, useContext } from 'react';

export type ContextValue = Record<string, unknown>;

type RecorderEventsContextProps = {
  children: ReactNode;
  value: ContextValue;
};

export type GetContextValues = () => ContextValue[];

const Context = createContext<GetContextValues | undefined>(undefined);
Context.displayName = 'RecorderEventsContext';

export function useGetContextValues() {
  return useContext(Context);
}

export function RecorderEventsContext({ value, children }: RecorderEventsContextProps) {
  const parentValuesGetter = useGetContextValues();

  const getListeners = useCallback(() => {
    if (typeof parentValuesGetter === 'function') {
      const parentValues = parentValuesGetter();

      return [...parentValues, value];
    }

    return [value];
  }, [value, parentValuesGetter]);

  return <Context.Provider value={getListeners}>{children}</Context.Provider>;
}
