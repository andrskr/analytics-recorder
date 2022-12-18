// 1 case
// withRecorderEvents()(MyButton) -> injects createRecorderEvent prop
// 2 case refs
// 3rd case
// onClick: {
//   action: 'clicked',
//   componentName: 'my-button',
// }
// 4 case
// onClick: (create, props) => create({ action: 'clicked', foo: props.foo })

import type { RefAttributes, ComponentProps } from 'react';
import React, { forwardRef, type ComponentType, useMemo, useState, useCallback } from 'react';
import { RecorderEventListeners, useRecorderEventListeners } from './recorder-events-listener';

export type CreateRecorderEvent = () => void;

export class RecorderEvent {
  constructor(public payload: RecorderEventPayload, private listeners?: RecorderEventListeners) {}

  trigger() {
    this.listeners?.emit(this);
  }
}

type WithRecorderEventsInjectedProps = {
  createRecorderEvent: CreateRecorderEvent;
};

type RecorderEventPayload = Record<string, unknown>;
type RecorderEventCreator = (payload: RecorderEventPayload) => RecorderEvent;

type RecorderEventCallback<TProps> = (create: RecorderEventCreator, props: TProps) => RecorderEvent;

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

function enhance_<TProps, TEnhanceKeys extends SupportedKeysToEnhance<TProps>>(
  createRecorderEvent: RecorderEventCreator,
  props: TProps,
  enhancers: Record<TEnhanceKeys, EnhancerHandler<TProps>>,
) {
  return Object.keys(enhancers).reduce((acc, currentEnhancerName) => {
    const propsValue = props[currentEnhancerName as TEnhanceKeys];

    if (typeof propsValue !== 'function') {
      return acc;
    }

    const currentEnhancerHandler = enhancers[currentEnhancerName as TEnhanceKeys];

    const recorderEvent =
      typeof currentEnhancerHandler === 'function'
        ? currentEnhancerHandler(createRecorderEvent, props)
        : createRecorderEvent(currentEnhancerHandler);

    acc[currentEnhancerName as TEnhanceKeys] = new Proxy(propsValue, {
      apply(targetFn, thisArg, argArray) {
        return Reflect.apply(targetFn, thisArg, [...argArray, recorderEvent]);
      },
    }) as AddRecorderEventIfFunction<typeof propsValue>;

    return acc;
  }, {} as GetEnhancedProps<TProps, TEnhanceKeys>);
}

function useCreateRecorderEvents() {
  const listeners = useRecorderEventListeners();

  return useCallback(
    function createRecorderEvent(payload: RecorderEventPayload) {
      return new RecorderEvent(payload, listeners);
    },
    [listeners],
  );
}

function createPropsEnhancer(createRecorderEvent: RecorderEventCreator) {
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

function usePropsEnhancer(createRecorderEvent: RecorderEventCreator) {
  const [enhance] = useState(() => createPropsEnhancer(createRecorderEvent));

  return enhance;
}

function useRecorderEnhanceProps<
  TProps,
  TEnhanceKeys extends SupportedKeysToEnhance<TProps> = never,
>(
  createRecorderEvent: RecorderEventCreator,
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
    const createRecorderEvent = useCreateRecorderEvents();
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
