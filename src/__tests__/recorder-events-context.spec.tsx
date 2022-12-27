import { describe, it, expect } from 'vitest';

import { useGetContextValues, RecorderEventsContext } from '../recorder-events-context';
import { renderHook } from '../tests';
import { createWrapper } from '../tests/create-wrapper';
import type { WrapperProps } from '../tests/create-wrapper';

describe('RecorderEventsContext', () => {
  it('provides context values to the children', () => {
    const value = { foo: 'bar' };
    const { result } = renderHook(useGetContextValues, {
      wrapper: createWrapper(RecorderEventsContext, { value }),
    });

    expect(result.current?.current).toEqual(expect.any(Function));

    expect(result.current?.current!()).toEqual([value]);
  });

  it('provides all context values from within a wrapped tree', () => {
    const parentValue = { foo: 'bar' };
    const currentValue = { baz: 'qux' };

    const ParentWrapper = createWrapper(RecorderEventsContext, { value: parentValue });
    const CurrentWrapper = createWrapper(RecorderEventsContext, { value: currentValue });
    function Wrapper({ children }: WrapperProps) {
      return (
        <ParentWrapper>
          <CurrentWrapper>{children}</CurrentWrapper>
        </ParentWrapper>
      );
    }

    const { result } = renderHook(useGetContextValues, {
      wrapper: Wrapper,
    });

    expect(result.current?.current!()).toEqual([parentValue, currentValue]);
  });
});
