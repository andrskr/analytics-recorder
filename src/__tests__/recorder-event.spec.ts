import { describe, it, expect, vi } from 'vitest';

import { RecorderEvent } from '../recorder-event';

describe('RecorderEvent', () => {
  it('updates the payload with provided values', () => {
    const foo = { foo: 'bar' };
    const baz = { baz: 'qux' };
    const expected = { ...foo, ...baz };

    const event = new RecorderEvent(foo);
    event.update(baz);

    expect(event.payload).toEqual(expected);
  });

  it('updates the payload with the result of the provided function', () => {
    const foo = { foo: 'bar' };
    const baz = { baz: 'qux' };
    const expected = { ...foo, ...baz };

    const event = new RecorderEvent(foo);
    event.update((prev) => ({ ...prev, ...baz }));

    expect(event.payload).toEqual(expected);
  });

  it('triggers the event handlers with event and channel', () => {
    const handlers = [vi.fn(), vi.fn()];
    const event = new RecorderEvent({ foo: 'bar' }, handlers);
    const channel = 'channel';

    event.trigger(channel);

    handlers.forEach((currentHandler) => {
      expect(currentHandler).toHaveBeenCalledOnce();
      expect(currentHandler).toHaveBeenCalledWith(event, channel);
    });
  });
});
