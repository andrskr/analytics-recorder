import { describe, it, expect } from 'vitest';

import { isAutoTriggered } from '../auto-trigger';

describe('isAutoTriggered', () => {
  it.each([
    { eventName: 'onClick', autoTriggerOption: true, expectedResult: true },
    { eventName: 'onClick', autoTriggerOption: false, expectedResult: false },
    { eventName: 'onClick', expectedResult: false },
    {
      eventName: 'onClick',
      autoTriggerOption: { include: new Set(['onClick']) },
      expectedResult: true,
    },
    {
      eventName: 'onFocus',
      autoTriggerOption: { include: new Set(['onClick']) },
      expectedResult: false,
    },
    {
      eventName: 'onClick',
      autoTriggerOption: { include: (eventName: string) => eventName === 'onClick' },
      expectedResult: true,
    },
    {
      eventName: 'onFocus',
      autoTriggerOption: { include: (eventName: string) => eventName === 'onClick' },
      expectedResult: false,
    },
    {
      eventName: 'onClick',
      autoTriggerOption: { exclude: new Set(['onClick']) },
      expectedResult: false,
    },
    {
      eventName: 'onClick',
      autoTriggerOption: { exclude: new Set(['onFocus']) },
      expectedResult: true,
    },
    {
      eventName: 'onClick',
      autoTriggerOption: { exclude: (eventName: string) => eventName === 'onClick' },
      expectedResult: false,
    },
    {
      eventName: 'onClick',
      autoTriggerOption: { exclude: (eventName: string) => eventName === 'onFocus' },
      expectedResult: true,
    },
  ])(
    `returns $expectedResult for event name $eventName and option $autoTriggerOption`,
    ({ eventName, autoTriggerOption, expectedResult }) => {
      const result = isAutoTriggered(eventName, autoTriggerOption);

      expect(result).toBe(expectedResult);
    },
  );

  it('throws an error if autoTrigger option is invalid', () => {
    // @ts-expect-error
    expect(() => isAutoTriggered('onClick', 'blahblan')).toThrowErrorMatchingInlineSnapshot(
      '"unsupported autoTrigger option blahblan"',
    );
  });
});
