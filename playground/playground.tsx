import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';

import type { RecorderEvent } from '../src';
import {
  CATCH_ALL_CHANNEL,
  RecorderEventsContext,
  RecorderEventsListener,
  useRecorderEventsCallback,
  withEventsContext,
  withRecorderEvents,
} from '../src';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  createRecorderEvent: RecorderEvent;
};

const ForwardedButton = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { createRecorderEvent: _, ...props },
  ref,
) {
  return <button type="button" ref={ref} {...props} />;
});

function RegularButton({ createRecorderEvent: _, ...props }: ButtonProps) {
  return <button type="button" {...props} />;
}

type ClickableBlockProps = {
  onClick: (event: MouseEvent<HTMLDivElement>, recorderEvent: RecorderEvent) => void;
};

function ClickableBlock({ onClick }: ClickableBlockProps) {
  const handleClick = useRecorderEventsCallback(
    onClick,
    useMemo(() => ({ action: 'click', element: 'clickableBlock' }), []),
  );

  // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
  return <div onClick={handleClick}>Click me</div>;
}

const AnalyticalButton = withRecorderEvents(ForwardedButton, {
  events: {
    onClick: {
      action: 'click',
      type: 'forwarded',
    },
    onMouseOut: {
      action: 'mouseOut',
    },
  },
  // autoTrigger: {
  //   // exclude: new Set(['onClick'] as const),
  //   // include: new Set(['onClick'] as const),
  // },
});
const AnalyticalButtonRegular = withRecorderEvents(RegularButton, {
  events: {
    onClick: (create) => create({ action: 'click', type: 'regular' }),
  },
});
const ContextualAnalyticalButton = withEventsContext({ withEventsContext: true })(AnalyticalButton);

export function Playground() {
  const [count, setCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleIncrement = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const handleAnalyticalEvent = useCallback((_: unknown, recorderEvent: RecorderEvent) => {
    console.log('Log Event', recorderEvent);
  }, []);

  const handleRecorderEvents = useCallback((recorderEvent: RecorderEvent) => {
    console.log('Listener', recorderEvent);
  }, []);

  const eventContext = useMemo(() => ({ container: 'app' }), []);

  const clickableBlockHandler = useCallback((_: unknown, recorderEvent: RecorderEvent) => {
    console.log('useRecorderEventsCallback', recorderEvent);
  }, []);

  return (
    <RecorderEventsListener onEvent={handleRecorderEvents} channel={CATCH_ALL_CHANNEL}>
      <RecorderEventsContext value={eventContext}>
        <div className="App">
          <div className="card">
            {/* <h1>Ticker: {tickerValue}</h1> */}
            <AnalyticalButton
              onClick={handleIncrement}
              ref={buttonRef}
              onMouseOut={handleAnalyticalEvent}
            >
              count is {count}
            </AnalyticalButton>
            <AnalyticalButtonRegular onClick={handleAnalyticalEvent}>
              Regular
            </AnalyticalButtonRegular>
            <ContextualAnalyticalButton onClick={handleAnalyticalEvent}>
              Contextual
            </ContextualAnalyticalButton>
            <ClickableBlock onClick={clickableBlockHandler} />
          </div>
        </div>
      </RecorderEventsContext>
    </RecorderEventsListener>
  );
}
