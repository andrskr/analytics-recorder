import type { ComponentPropsWithoutRef } from 'react';
import { createRef, forwardRef } from 'react';
import { describe, expect, it } from 'vitest';

import { render, screen } from '../tests';
import { withEventsContext } from '../with-events-context';

describe('withEventsContext', () => {
  it('defines a correct displayName for the provided component', () => {
    const displayName = 'Component';

    function Component() {
      return null;
    }

    Component.displayName = displayName;

    const EnhancedComponent = withEventsContext({ foo: 'bar' })(Component);

    expect(EnhancedComponent.displayName).toEqual(`withEventsContext(${displayName})`);
  });

  it('allow to pass a reference', () => {
    type ButtonProps = ComponentPropsWithoutRef<'button'>;
    const buttonRef = createRef<HTMLButtonElement>();

    const ForwardedButton = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
      return <button type="button" ref={ref} {...props} />;
    });

    const EnhancedComponent = withEventsContext({ foo: 'bar' })(ForwardedButton);

    render(<EnhancedComponent ref={buttonRef} />);

    const button = screen.getByRole('button');

    expect(buttonRef.current).toBe(button);
  });
});
