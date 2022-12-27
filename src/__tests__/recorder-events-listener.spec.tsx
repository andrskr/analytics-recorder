import { describe, expect, it, vi } from 'vitest';

import {
  CATCH_ALL_CHANNEL,
  RecorderEventsListener,
  useGetEventHandlers,
} from '../recorder-events-listener';
import { renderHook } from '../tests';
import type { WrapperProps } from '../tests/create-wrapper';
import { createWrapper } from '../tests/create-wrapper';

describe('RecorderEventsListener', () => {
  it('provides listeners to the children', () => {
    const onEvent = vi.fn();
    const { result } = renderHook(useGetEventHandlers, {
      wrapper: createWrapper(RecorderEventsListener, { onEvent }),
    });

    expect(result.current?.current).toEqual(expect.any(Function));

    expect(result.current?.current!().length).toEqual(1);
  });

  it('provides all context values from within a wrapped tree', () => {
    const parentOnEvent = vi.fn();
    const currentOnEvent = vi.fn();
    const otherOnEvent = vi.fn();

    const ParentWrapper = createWrapper(RecorderEventsListener, { onEvent: parentOnEvent });
    const CurrentWrapper = createWrapper(RecorderEventsListener, { onEvent: currentOnEvent });
    const OtherWrapper = createWrapper(RecorderEventsListener, { onEvent: otherOnEvent });

    function Wrapper({ children }: WrapperProps) {
      return (
        <ParentWrapper>
          <OtherWrapper>Other</OtherWrapper>
          <CurrentWrapper>{children}</CurrentWrapper>
        </ParentWrapper>
      );
    }

    const { result } = renderHook(useGetEventHandlers, {
      wrapper: Wrapper,
    });

    expect(result.current?.current!().length).toEqual(2);
  });

  it('receives ALL events if the provided channel is CATCH_ALL_CHANNEL', () => {
    const onEvent = vi.fn();
    const { result } = renderHook(useGetEventHandlers, {
      wrapper: createWrapper(RecorderEventsListener, { onEvent, channel: CATCH_ALL_CHANNEL }),
    });

    const handlers = result.current?.current!();

    handlers?.forEach((currentHandler) => {
      // @ts-ignore
      currentHandler(undefined, 'randomChannel');

      expect(onEvent).toHaveBeenCalledOnce();
    });
  });

  it('receives events if provided channel is the same as handler channel', () => {
    const parentOnEvent = vi.fn();
    const currentOnEvent = vi.fn();
    const channel = 'testChannel';

    const ParentWrapper = createWrapper(RecorderEventsListener, {
      onEvent: parentOnEvent,
      channel,
    });
    const CurrentWrapper = createWrapper(RecorderEventsListener, { onEvent: currentOnEvent });

    function Wrapper({ children }: WrapperProps) {
      return (
        <ParentWrapper>
          <CurrentWrapper>{children}</CurrentWrapper>
        </ParentWrapper>
      );
    }

    const { result } = renderHook(useGetEventHandlers, {
      wrapper: Wrapper,
    });

    const handlers = result.current?.current!();

    handlers?.forEach((currentHandler) => {
      // @ts-ignore
      currentHandler(undefined, channel);

      expect(parentOnEvent).toHaveBeenCalledOnce();
      expect(currentOnEvent).not.toHaveBeenCalled();
    });
  });
});
