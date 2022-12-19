import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { forwardRef, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import './App.css';
import type { RecorderEvent } from './recorder-event';
import { CATCH_ALL_CHANNEL } from './recorder-event';
import { RecorderEventsContext } from './recorder-events-context';
import { RecorderEventsListener } from './recorder-events-listener';
import { useRecorderEventsCallback } from './use-recorder-events-callback';
import { withEventsContext } from './with-events-context';
import { withRecorderEvents } from './with-recorder-events';

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
  onClick: {
    action: 'click',
    type: 'forwarded',
  },
});
const AnalyticalButtonRegular = withRecorderEvents(RegularButton, {
  onClick: (create) => create({ action: 'click', type: 'regular' }),
});
const ContextualAnalyticalButton = withEventsContext({ withEventsContext: true })(AnalyticalButton);

function createTicker(ms: number) {
  const ticker = {
    timer: null,
    subscribers: new Set(),
    state: {
      current: 0,
    },
    setState: (updater) => {
      ticker.state = updater(ticker.state);
      for (const currentSubscriber of ticker.subscribers.values()) {
        currentSubscriber.notify();
      }
    },
    subscribe: (subscriber) => {
      ticker.subscribers.add(subscriber);

      return () => {
        ticker.subscribers.delete(subscriber);
      };
    },
    run: () => {
      if (ticker.timer) {
        clearInterval(ticker.timer);
      }

      ticker.timer = setInterval(
        () => ticker.setState((prev) => ({ ...prev, current: prev.current + 1 })),
        ms,
      );
    },
  };

  return ticker;
}

function createTickerObserver(ms: number) {
  const ticker = createTicker(ms);

  const observer = {
    run: () => {
      ticker.run();
    },
    notify: () => {},
    subscribe: (subscriber) => {
      observer.notify = subscriber;

      const dispose = ticker.subscribe(observer);

      observer.run();

      return () => {
        dispose();
        observer.notify = () => {};
      };
    },
    getState: () => ticker.state,
  };

  return observer;
}

type Observer = ReturnType<typeof createTickerObserver>;

function useTicker(ms: number) {
  const tickerRef = useRef<Observer>();
  const [_, rerender] = useReducer((state) => state + 1, 0);

  if (!tickerRef.current) {
    tickerRef.current = createTickerObserver(ms);
  }

  useEffect(() => {
    return tickerRef.current!.subscribe(rerender);
  }, [rerender]);

  return tickerRef.current.getState();
}

function App() {
  const [count, setCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // const { current: tickerValue } = useTicker(1000);

  const handleIncrement = useCallback((_: unknown, recorderEvent: RecorderEvent) => {
    console.log(recorderEvent);
    setCount((c) => c + 1);
  }, []);

  const handleAnalyticalEvent = useCallback((_: unknown, recorderEvent: RecorderEvent) => {
    recorderEvent.trigger('testChannel');
  }, []);

  const handleRecorderEvents = useCallback((recorderEvent: RecorderEvent) => {
    console.log('Listener', recorderEvent);
  }, []);

  const eventContext = useMemo(() => ({ container: 'app' }), []);

  const clickableBlockHandler = useCallback((_, recorderEvent: RecorderEvent) => {
    console.log('useRecorderEventsCallback', recorderEvent);
  }, []);

  return (
    <RecorderEventsListener onEvent={handleRecorderEvents} channel={CATCH_ALL_CHANNEL}>
      <RecorderEventsContext value={eventContext}>
        <div className="App">
          <div className="card">
            {/* <h1>Ticker: {tickerValue}</h1> */}
            <AnalyticalButton onClick={handleIncrement} ref={buttonRef}>
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

export default App;
