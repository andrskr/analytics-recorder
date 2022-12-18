import type { RefAttributes, ComponentProps } from 'react';
import { forwardRef, type ComponentType, useState } from 'react';

import type { RecorderEventPayload, RecorderEvent } from './recorder-event';
import type { RecorderEvents } from './use-recorder-events';
import { useRecorderEvents } from './use-recorder-events';

type WithRecorderEventsInjectedProps = {
  createRecorderEvent: RecorderEvents;
};

type RecorderEventCallback<TProps> = (create: RecorderEvents, props: TProps) => RecorderEvent;

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

type GetEnhancedProps<TProps, TEnhanceKeys extends SupportedKeysToEnhance<TProps>> = {
  [TEnhancerName in TEnhanceKeys]: AddRecorderEventIfFunction<TProps[TEnhancerName]>;
};

function createPropsEnhancer(createRecorderEvent: RecorderEvents) {
  const enhancedProps = new WeakMap();

  return function enhance<TProps, TEnhanceKeys extends SupportedKeysToEnhance<TProps>>(
    props: TProps,
    enhancers: Record<TEnhanceKeys, EnhancerHandler<TProps>>,
  ) {
    return Object.keys(enhancers).reduce((acc, currentEnhancerName) => {
      const propsValue = props[currentEnhancerName as TEnhanceKeys];

      if (typeof propsValue !== 'function') {
        return acc;
      }

      if (enhancedProps.has(propsValue)) {
        acc[currentEnhancerName as TEnhanceKeys] = enhancedProps.get(propsValue);

        return acc;
      }

      const enhancedProp = new Proxy(propsValue, {
        apply(targetFn, thisArg, argArray) {
          const currentEnhancerHandler = enhancers[currentEnhancerName as TEnhanceKeys];

          const recorderEvent =
            typeof currentEnhancerHandler === 'function'
              ? currentEnhancerHandler(createRecorderEvent, props)
              : createRecorderEvent(currentEnhancerHandler);

          return Reflect.apply(targetFn, thisArg, [...argArray, recorderEvent]);
        },
      }) as AddRecorderEventIfFunction<typeof propsValue>;

      enhancedProps.set(propsValue, enhancedProp);
      acc[currentEnhancerName as TEnhanceKeys] = enhancedProp;

      return acc;
    }, {} as GetEnhancedProps<TProps, TEnhanceKeys>);
  };
}

function usePropsEnhancer(createRecorderEvent: RecorderEvents) {
  const [enhance] = useState(() => createPropsEnhancer(createRecorderEvent));

  return enhance;
}

function useRecorderEnhanceProps<
  TProps,
  TEnhanceKeys extends SupportedKeysToEnhance<TProps> = never,
>(
  createRecorderEvent: RecorderEvents,
  props: TProps,
  enhancers?: Record<TEnhanceKeys, EnhancerHandler<TProps>>,
) {
  const enhance = usePropsEnhancer(createRecorderEvent);

  return typeof enhancers !== 'undefined' && enhance(props, enhancers);
}

export function withRecorderEvents<
  TProps,
  TEnhanceKeys extends SupportedKeysToEnhance<TProps> = never,
  TRef = never,
>(
  WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
  enhancers?: Record<TEnhanceKeys, EnhancerHandler<TProps>>,
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ForwardedWrapper = forwardRef<
    TRef,
    Omit<
      ComponentProps<typeof WrappedComponent>,
      keyof WithRecorderEventsInjectedProps | TEnhanceKeys
    > &
      GetEnhancedProps<TProps, TEnhanceKeys>
  >(function Wrapper(props, ref) {
    const createRecorderEvent = useRecorderEvents();
    const enhancedProps = useRecorderEnhanceProps(createRecorderEvent, props as TProps, enhancers);

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
