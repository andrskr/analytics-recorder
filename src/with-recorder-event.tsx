// 1 case
// withRecorderEvents()(MyButton) -> injects createRecorderEvent prop
// 2 case refs
// 3rd case
// onClick: {
//   action: 'clicked',
//   componentName: 'my-button',
// }
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

type GetEnhancedProps<TProps, TEnhanceKeys extends keyof TProps> = {
  [TEnhancerName in TEnhanceKeys]: TProps[TEnhancerName];
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
        console.log({ [currentEnhancerName]: recorderEvent });

        return Reflect.apply(targetFn, thisArg, argArray);
      },
    });

    return acc;
  }, {} as GetEnhancedProps<TProps, keyof typeof enhancers>);
}

const res = enhance(
  () => new RecorderEvent({ test: 'test' }),
  { foo: 1, bar: 2, test: () => 3, test1: () => 4, x: 'x' as any },
  {
    test: (create, props) => {
      return create({ action: 'test', foo: props.foo });
    },
    test1: {
      payload: true,
    },
  },
);

console.log(res);

function useRecorderEvents() {
  return function createRecorderEvent(payload: RecorderEventPayload) {
    return new RecorderEvent(payload);
  };
}

function useRecorderEnhanceProps<TProps, TEnhanceKeys extends SupportedKeysToEnhance<TProps>>(
  props: TProps,
  enhancers?: Record<TEnhanceKeys, EnhancerHandler<TProps>>,
) {
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
  TEnhanceKeys extends SupportedKeysToEnhance<TProps>,
  TRef = never,
>(
  WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
  enhancers?: Record<TEnhanceKeys, EnhancerHandler<TProps>>,
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ForwardedWrapper = forwardRef<
    TRef,
    Omit<ComponentProps<typeof WrappedComponent>, keyof WithRecorderEventsInjectedProps>
  >(function Wrapper(props, ref) {
    const enhancedProps = useRecorderEnhanceProps(props as TProps, enhancers);

    return (
      <WrappedComponent
        {...(props as ComponentProps<typeof WrappedComponent>)}
        {...(enhancedProps as ComponentProps<typeof WrappedComponent>)}
        ref={ref}
        createRecorderEvent={() => new RecorderEvent({ direct: true })}
      />
    );
  });

  ForwardedWrapper.displayName = `withRecorderEvents(${displayName})`;

  return ForwardedWrapper;
}

export function withLogCallbacksCall<TProps extends Record<string, unknown>>(
  WrappedComponent: ComponentType<TProps>,
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function Wrapper(props: TProps) {
    const enhancedProps = new Proxy(
      { ...props },
      {
        get(target, prop) {
          if (typeof target[prop as string] !== 'function') {
            return Reflect.get(target, prop);
          }

          return new Proxy(target[prop as string] as AnyFunction, {
            apply(targetFn, thisArg, argArray) {
              console.log({ [prop]: argArray });

              return Reflect.apply(targetFn, thisArg, argArray);
            },
          });
        },
      },
    );

    return <WrappedComponent {...enhancedProps} />;
  }

  Wrapper.displayName = `withLogCallbacksCall(${displayName})`;

  return Wrapper;
}
