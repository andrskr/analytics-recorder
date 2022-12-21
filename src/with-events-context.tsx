import type { ComponentType, RefAttributes } from 'react';
import { forwardRef } from 'react';

import type { ContextValue } from './recorder-events-context';
import { RecorderEventsContext } from './recorder-events-context';

export function withEventsContext(contextValue: ContextValue) {
  return function wrap<TProps extends object, TRef = never>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
  ) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const ForwardedWrapper = forwardRef<TRef, TProps>(function Wrapper(props, ref) {
      return (
        <RecorderEventsContext value={contextValue}>
          <WrappedComponent {...(props as TProps)} ref={ref} />
        </RecorderEventsContext>
      );
    });

    ForwardedWrapper.displayName = `withEventsContext(${displayName})`;

    return ForwardedWrapper;
  };
}
