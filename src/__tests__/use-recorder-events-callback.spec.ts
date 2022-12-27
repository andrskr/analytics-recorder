import { describe, it, expect, vi, afterEach } from 'vitest';

import { RecorderEvent } from '../recorder-event';
import { renderHook } from '../tests';
import { useRecorderEvents } from '../use-recorder-events';
import { useRecorderEventsCallback } from '../use-recorder-events-callback';

vi.mock('../use-recorder-events', () => ({
  useRecorderEvents: vi.fn(),
}));

describe('useRecorderEventsCallback', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('injects Recorder Event as last argument for provided callback', () => {
    let event;
    vi.mocked(useRecorderEvents).mockReturnValueOnce((payload) => {
      event = new RecorderEvent(payload);

      return event;
    });
    const callback = vi.fn((_: unknown, _event: RecorderEvent) => {});

    const { result } = renderHook(() => useRecorderEventsCallback(callback, { foo: 'bar' }));
    result.current(null);

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(null, event);
  });
});
