import { describe, it, expect, vi, afterEach } from 'vitest';

import { RecorderEvent } from '../recorder-event';
import { useGetContextValues } from '../recorder-events-context';
import { useGetEventHandlers } from '../recorder-events-listener';
import { renderHook } from '../tests';
import { useRecorderEvents } from '../use-recorder-events';

vi.mock('../recorder-events-context', () => ({
  useGetContextValues: vi.fn(),
}));

vi.mock('../recorder-events-listener', () => ({
  useGetEventHandlers: vi.fn(),
}));

describe('useRecorderEvents', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a function that allows to create RecorderEvent', () => {
    const context = [] as any[];
    const handlers = [] as any[];
    const payload = { foo: 'bar' };
    vi.mocked(useGetContextValues).mockReturnValueOnce({ current: vi.fn(() => context) });
    vi.mocked(useGetEventHandlers).mockReturnValueOnce({ current: vi.fn(() => handlers) });

    const { result } = renderHook(useRecorderEvents);
    const recorderEvent = result.current(payload);

    expect(recorderEvent).toEqual(expect.any(RecorderEvent));
    expect(recorderEvent.payload).toBe(payload);
    expect(recorderEvent.context).toBe(context);
  });
});
