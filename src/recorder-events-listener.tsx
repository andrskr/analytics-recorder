import type { ReactNode } from 'react';
import { createContext, useContext, useLayoutEffect, useState } from 'react';

import type { RecorderEvent } from './recorder-event';

export const CATCH_ALL_CHANNEL = Symbol('catch-all');
export type Channel = typeof CATCH_ALL_CHANNEL | string;

export type RecorderEventHandler = (recorderEvent: RecorderEvent) => void;
type ChannelAwareEventHandler = (recorderEvent: RecorderEvent, channel?: Channel) => void;

type RecorderEventsListenerProps = {
  children: ReactNode;
  onEvent: RecorderEventHandler;
  channel?: Channel;
};

function createHandlersRegistry() {
  const registry = new Set<ChannelAwareEventHandler>();

  const addHandler = (handler: RecorderEventHandler, channel?: Channel) => {
    const channelAwareHandler: ChannelAwareEventHandler = (recorderEvent, eventChannel?) => {
      if (channel === CATCH_ALL_CHANNEL || channel === eventChannel) {
        handler(recorderEvent);
      }
    };

    registry.add(channelAwareHandler);

    return () => {
      registry.delete(channelAwareHandler);
    };
  };

  return {
    handlers: registry,
    addHandler,
  };
}

const HandlersRegistryContext = createContext<
  ReturnType<typeof createHandlersRegistry> | undefined
>(undefined);
HandlersRegistryContext.displayName = 'HandlersRegistryContext';

export function useHandlersRegistry() {
  return useContext(HandlersRegistryContext);
}

type HandlerRegistryProviderProps = {
  children: ReactNode;
};

function HandlersRegistryProvider({ children }: HandlerRegistryProviderProps) {
  const [registry] = useState(() => createHandlersRegistry());

  return (
    <HandlersRegistryContext.Provider value={registry}>{children}</HandlersRegistryContext.Provider>
  );
}

type HandlersRegistryHandlerProps = {
  children: ReactNode;
  handler: RecorderEventHandler;
  channel?: Channel;
};

function HandlersRegistryHandler({ children, handler, channel }: HandlersRegistryHandlerProps) {
  const registry = useHandlersRegistry();

  if (typeof registry === 'undefined') {
    throw new Error('HandlersRegistryHandler must be used within HandlersRegistryProvider');
  }

  useLayoutEffect(() => {
    return registry.addHandler(handler, channel);
  }, [channel, handler, registry]);

  return children as JSX.Element;
}

export function RecorderEventsListener({
  children,
  onEvent,
  channel,
}: RecorderEventsListenerProps) {
  const registry = useHandlersRegistry();

  if (typeof registry === 'undefined') {
    return (
      <HandlersRegistryProvider>
        <HandlersRegistryHandler handler={onEvent} channel={channel}>
          {children}
        </HandlersRegistryHandler>
      </HandlersRegistryProvider>
    );
  }

  return (
    <HandlersRegistryHandler handler={onEvent} channel={channel}>
      {children}
    </HandlersRegistryHandler>
  );
}
