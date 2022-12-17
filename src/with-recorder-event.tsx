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
import React, { forwardRef, type ComponentType, useMemo } from 'react';

export type CreateRecorderEvent = () => void;

class RecorderEvent {
  constructor(public payload: RecorderEventPayload) {}
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

function enhance<TProps, TEnhanceKeys extends SupportedKeysToEnhance<TProps>>(
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

function useRecorderEvents() {
  return function createRecorderEvent(payload: RecorderEventPayload) {
    return new RecorderEvent(payload);
  };
}

function useRecorderEnhanceProps<
  TProps,
  TEnhanceKeys extends SupportedKeysToEnhance<TProps> = never,
>(props: TProps, enhancers?: Record<TEnhanceKeys, EnhancerHandler<TProps>>) {
  const createRecorderEvent = useRecorderEvents();

  return useMemo(() => {
    if (typeof enhancers === 'undefined') {
      return undefined;
    }

    return enhance(createRecorderEvent, props, enhancers);
  }, [createRecorderEvent, enhancers, props]);
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
    const enhancedProps = useRecorderEnhanceProps(props as TProps, enhancers);

    return (
      <WrappedComponent
        {...(props as TProps)}
        {...enhancedProps}
        ref={ref}
        createRecorderEvent={() => new RecorderEvent({ direct: true })}
      />
    );
  });

  ForwardedWrapper.displayName = `withRecorderEvents(${displayName})`;

  return ForwardedWrapper;
}
