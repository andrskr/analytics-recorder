import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { forwardRef, useEffect, useReducer, useRef, useState } from 'react';

import './App.css';

import type { CreateRecorderEvent } from './with-recorder-event';
import {
  extractFns,
  inject,
  withLogCallbacksCall,
  withRecorderEvents,
} from './with-recorder-event';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  createRecorderEvent?: CreateRecorderEvent;
};

const ForwardedButton = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { createRecorderEvent, onClick, ...props },
  ref,
) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    createRecorderEvent?.();
    onClick?.(event);
  };

  return <button type="button" onClick={handleClick} ref={ref} {...props} />;
});

function RegularButton({ createRecorderEvent, onClick, ...props }: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    createRecorderEvent?.();
    onClick?.(event);
  };

  return <button type="button" onClick={handleClick} {...props} />;
}

const AnalyticalButton = withRecorderEvents(ForwardedButton);
const AnalyticalButtonRegular = withRecorderEvents(RegularButton, {
  onClick: {
    test: 'test',
  },
});
const LogButton = withLogCallbacksCall(RegularButton);
const Injected = inject(RegularButton, {
  onClick: () => {},
});

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

  return (
    <div className="App">
      <div className="card">
        {/*<h1>Ticker: {tickerValue}</h1>*/}
        <AnalyticalButton onClick={(event) => console.log(event)} ref={buttonRef}>
          count is {count}
        </AnalyticalButton>
        <AnalyticalButtonRegular onClick={(_, recorderEvent) => console.log(recorderEvent)}>
          Regular
        </AnalyticalButtonRegular>
        <LogButton>Log</LogButton>
        <Injected>Injected</Injected>
      </div>
    </div>
  );
}

export default App;
