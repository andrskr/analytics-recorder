import type { MutableRefObject, ReactNode } from 'react';
import { createContext, useContext, useLayoutEffect, useRef } from 'react';

export type ContextValue = Record<string, unknown>;

type RecorderEventsContextProps = {
  children: ReactNode;
  value: ContextValue;
};

export type GetContextValues = () => ContextValue[];

const GetContextValuesContext = createContext<
  MutableRefObject<GetContextValues | undefined> | undefined
>(undefined);
GetContextValuesContext.displayName = 'GetContextValuesContext';

export function useGetContextValues() {
  return useContext(GetContextValuesContext);
}

export function RecorderEventsContext({ value, children }: RecorderEventsContextProps) {
  const getValuesRef = useRef<GetContextValues>();
  const parentGetValues = useGetContextValues();

  useLayoutEffect(() => {
    getValuesRef.current = () => {
      if (typeof parentGetValues?.current === 'function') {
        const parentValues = parentGetValues.current();

        return [...parentValues, value];
      }

      return [value];
    };
  }, [parentGetValues, value]);

  return (
    <GetContextValuesContext.Provider value={getValuesRef}>
      {children}
    </GetContextValuesContext.Provider>
  );
}
