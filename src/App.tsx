import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { forwardRef, useCallback, useEffect, useReducer, useRef, useState } from 'react';

import './App.css';
import type { CreateRecorderEvent } from './with-recorder-event';
import { RecorderEvent, withRecorderEvents } from './with-recorder-event';
import { RecorderEventsListener } from './recorder-events-listener';

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

  const handleIncrement = useCallback(() => setCount((c) => c + 1), []);
  const handleAnalyticalEvent = useCallback((_: unknown, recorderEvent: RecorderEvent) => {
    console.log(recorderEvent);
    recorderEvent.trigger();
  }, []);

  // const handleRecorderEvents = (recorderEvent: RecorderEvent) => {
  //   console.log('Listener', recorderEvent);
  // };

  return (
    <div className="App">
      <div className="card">
        {/* <h1>Ticker: {tickerValue}</h1> */}
        <AnalyticalButton onClick={handleIncrement} ref={buttonRef}>
          count is {count}
        </AnalyticalButton>
        <AnalyticalButtonRegular onClick={handleAnalyticalEvent}>Regular</AnalyticalButtonRegular>
      </div>
    </div>
  );

  // return (
  //   <RecorderEventsListener onEvent={handleRecorderEvents}>
  //     <RecorderEventsListener onEvent={handleRecorderEvents}>
  //       <RecorderEventsListener onEvent={handleRecorderEvents}>
  //         <div className="App">
  //           <div className="card">
  //             {/* <h1>Ticker: {tickerValue}</h1> */}
  //             <AnalyticalButton onClick={handleIncrement} ref={buttonRef}>
  //               count is {count}
  //             </AnalyticalButton>
  //             <AnalyticalButtonRegular onClick={handleAnalyticalEvent}>
  //               Regular
  //             </AnalyticalButtonRegular>
  //           </div>
  //         </div>
  //       </RecorderEventsListener>
  //     </RecorderEventsListener>
  //   </RecorderEventsListener>
  // );
}

export default App;
