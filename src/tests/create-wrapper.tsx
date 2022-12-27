import type { ComponentType, ReactNode } from 'react';

export type WrapperProps = {
  children: ReactNode;
};

export function createWrapper<TProps>(
  WrappedComponent: ComponentType<TProps>,
  props: Omit<TProps, 'children'>,
) {
  return function Wrapper({ children }: WrapperProps) {
    return <WrappedComponent {...(props as TProps)}>{children}</WrappedComponent>;
  };
}
