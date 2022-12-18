import type { ReactNode } from 'react';
import { createContext, useCallback, useContext } from 'react';

type CollectorProps<TValue> = {
  children: ReactNode;
  value: TValue;
};

export function treePropCollector<TValue>(displayName: string) {
  const Context = createContext<(() => TValue[]) | undefined>(undefined);
  Context.displayName = displayName;

  const useValuesGetter = () => useContext(Context);

  function Collector({ children, value }: CollectorProps<TValue>) {
    const parentGetValues = useValuesGetter();

    const getValues = useCallback(() => {
      if (typeof parentGetValues === 'function') {
        const parentValues = parentGetValues();

        return [...parentValues, value];
      }

      return [value];
    }, [value, parentGetValues]);

    return <Context.Provider value={getValues}>{children}</Context.Provider>;
  }

  return [Collector, useValuesGetter] as const;
}
