import type { RefAttributes, ComponentProps, ComponentType } from 'react';
import { forwardRef, useState, useMemo } from 'react';

import type { AutoTriggerEvents } from './auto-trigger';
import { isAutoTriggered } from './auto-trigger';
import type { RecorderEventPayload, RecorderEvent } from './recorder-event';
import type { Channel } from './recorder-events-listener';
import type { RecorderEvents } from './use-recorder-events';
import { useRecorderEvents } from './use-recorder-events';

type WithRecorderEventsInjectedProps = {
  createRecorderEvent: RecorderEvents;
};

type RecorderEventCallback<TProps> = (create: RecorderEvents, props: TProps) => RecorderEvent;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

type ExtractKeysByValue<T, TExtract> = {
  [TKey in keyof T as TExtract extends T[TKey] ? TKey : never]: T[TKey];
};

type SupportedKeysToEnhance<T> = keyof ExtractKeysByValue<T, AnyFunction>;
type EnhancerHandler<TProps> = RecorderEventPayload | RecorderEventCallback<TProps>;

type AddParams<TFn extends AnyFunction, TParams extends [...args: unknown[]]> = (
  ...args: [...Parameters<TFn>, ...TParams]
) => ReturnType<TFn>;
type AddRecorderEventIfFunction<T> = T extends AnyFunction
  ? AddParams<T, [recorderEvent: RecorderEvent]>
  : T;

type GetEnhancedProps<TProps, TEventName extends keyof TProps> = {
  [TEnhancerName in TEventName]: AddRecorderEventIfFunction<TProps[TEnhancerName]>;
};

function createPropsEnhancer(createRecorderEvent: RecorderEvents) {
  const enhancedProps = new WeakMap();

  return function enhance<TProps, TEventName extends keyof TProps>(
    props: TProps,
    options: EventEnhancerOptions<TProps, TEventName>,
  ) {
    return Object.keys(options.events).reduce((acc, currentEnhancerName) => {
      const propsValue = props[currentEnhancerName as TEventName];

      if (typeof propsValue !== 'function') {
        return acc;
      }

      if (enhancedProps.has(propsValue)) {
        acc[currentEnhancerName as TEventName] = enhancedProps.get(propsValue);

        return acc;
      }

      const enhancedProp = new Proxy(propsValue, {
        apply(targetFn, thisArg, argArray) {
          const currentEnhancerHandler = options.events[currentEnhancerName as TEventName];

          const recorderEvent =
            typeof currentEnhancerHandler === 'function'
              ? currentEnhancerHandler(createRecorderEvent, props)
              : createRecorderEvent(currentEnhancerHandler);

          const autoTrigger = isAutoTriggered(
            currentEnhancerName as TEventName,
            options.autoTrigger as AutoTriggerEvents<TEventName>,
          );

          if (autoTrigger) {
            recorderEvent.trigger(options.channel);
          }

          return Reflect.apply(targetFn, thisArg, [...argArray, recorderEvent]);
        },
      }) as AddRecorderEventIfFunction<typeof propsValue>;

      enhancedProps.set(propsValue, enhancedProp);
      acc[currentEnhancerName as TEventName] = enhancedProp;

      return acc;
    }, {} as GetEnhancedProps<TProps, TEventName>);
  };
}

function usePropsEnhancer(createRecorderEvent: RecorderEvents) {
  const [enhance] = useState(() => createPropsEnhancer(createRecorderEvent));

  return enhance;
}

function useRecorderEnhanceProps<TProps, TEventName extends keyof TProps>(
  createRecorderEvent: RecorderEvents,
  props: TProps,
  options?: EventEnhancerOptions<TProps, TEventName>,
) {
  const enhance = usePropsEnhancer(createRecorderEvent);

  return useMemo(() => {
    if (typeof options?.events === 'undefined') {
      return undefined;
    }

    return enhance(props, options);
  }, [enhance, options, props]);
}

type CreateEventEnhancerOptions<TEvents> = TEvents extends infer TInferred
  ? { events: TEvents; autoTrigger?: AutoTriggerEvents<keyof TInferred>; channel?: Channel }
  : never;

type EventEnhancerOptions<TProps, TEventName extends keyof TProps> = CreateEventEnhancerOptions<
  Record<TEventName, EnhancerHandler<TProps>>
>;

export function withRecorderEvents<
  TProps,
  TEventName extends SupportedKeysToEnhance<TProps> = never,
  TRef = never,
>(
  WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
  options?: EventEnhancerOptions<TProps, TEventName>,
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ForwardedWrapper = forwardRef<
    TRef,
    Omit<
      ComponentProps<typeof WrappedComponent>,
      keyof WithRecorderEventsInjectedProps | TEventName
    > &
      GetEnhancedProps<TProps, TEventName>
  >(function Wrapper(props, ref) {
    const createRecorderEvent = useRecorderEvents();
    const enhancedProps = useRecorderEnhanceProps(createRecorderEvent, props as TProps, options);

    return (
      <WrappedComponent
        {...(props as TProps)}
        {...enhancedProps}
        ref={ref}
        createRecorderEvent={createRecorderEvent}
      />
    );
  });

  ForwardedWrapper.displayName = `withRecorderEvents(${displayName})`;

  return ForwardedWrapper;
}
