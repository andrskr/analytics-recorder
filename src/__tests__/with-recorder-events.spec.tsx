import type { ComponentPropsWithoutRef } from 'react';
import { createRef, forwardRef } from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';

import { RecorderEvent } from '../recorder-event';
import { render, screen, userEvent } from '../tests';
import { useRecorderEvents } from '../use-recorder-events';
import { withRecorderEvents } from '../with-recorder-events';

vi.mock('../use-recorder-events', () => ({
  useRecorderEvents: vi.fn(),
}));

describe('withRecorderEvents', () => {
  type ButtonProps = ComponentPropsWithoutRef<'button'> & {
    createRecorderEvent: RecorderEvent;
  };

  const ForwardedButton = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { createRecorderEvent: _, ...props },
    ref,
  ) {
    return <button type="button" ref={ref} {...props} />;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defines a correct displayName for the provided component', () => {
    const displayName = 'Component';

    function Component() {
      return null;
    }

    Component.displayName = displayName;

    const EnhancedComponent = withRecorderEvents(Component);

    expect(EnhancedComponent.displayName).toEqual(`withRecorderEvents(${displayName})`);
  });

  it('allow to pass a reference', () => {
    const buttonRef = createRef<HTMLButtonElement>();

    const EnhancedComponent = withRecorderEvents(ForwardedButton);

    render(<EnhancedComponent ref={buttonRef} />);

    const button = screen.getByRole('button');

    expect(buttonRef.current).toBe(button);
  });

  it('injects createRecorderEvent prop', () => {
    const create = vi.fn();
    vi.mocked(useRecorderEvents).mockReturnValueOnce(create);
    let componentCreate;
    function Component({ createRecorderEvent }: { createRecorderEvent: RecorderEvent }) {
      componentCreate = createRecorderEvent;

      return null;
    }

    const EnhancedComponent = withRecorderEvents(Component);

    render(<EnhancedComponent />);

    expect(componentCreate).toBe(create);
  });

  it('enhances the provided component properties by using provided config', async () => {
    vi.mocked(useRecorderEvents).mockReturnValueOnce((payload) => {
      return new RecorderEvent(payload);
    });

    const onClickMeta = {
      action: 'click',
    };

    const onFocusMeta = {
      action: 'focus',
    };

    const handleOnClick = vi.fn();
    const handleOnFocus = vi.fn();

    const EnhancedComponent = withRecorderEvents(ForwardedButton, {
      events: { onClick: onClickMeta, onFocus: onFocusMeta },
    });

    render(<EnhancedComponent onClick={handleOnClick} onFocus={handleOnFocus} />);

    const button = screen.getByRole('button');

    const user = userEvent.setup();
    button.focus();
    await user.click(button);

    expect(handleOnClick).toHaveBeenCalledOnce();

    expect(handleOnClick.mock.calls[0][1].payload).toEqual(onClickMeta);

    expect(handleOnFocus).toHaveBeenCalledOnce();
    expect(handleOnFocus.mock.calls[0][1].payload).toEqual(onFocusMeta);
  });

  it('enhances the provided component properties by using the result of the config function', async () => {
    vi.mocked(useRecorderEvents).mockReturnValueOnce((payload) => {
      return new RecorderEvent(payload);
    });

    const onClickMeta = {
      action: 'click',
    };

    const type = 'button';

    const handleOnClick = vi.fn();

    const EnhancedComponent = withRecorderEvents(ForwardedButton, {
      events: { onClick: (create, props) => create({ ...onClickMeta, type: props.type }) },
    });

    render(<EnhancedComponent onClick={handleOnClick} type={type} />);

    const button = screen.getByRole('button');

    const user = userEvent.setup();
    await user.click(button);

    expect(handleOnClick).toHaveBeenCalledOnce();
    expect(handleOnClick.mock.calls[0][1].payload).toEqual({ ...onClickMeta, type });
  });

  it('autoTrigger enables automatic event triggering (without manual event.trigger call)', async () => {
    const handler = vi.fn();
    vi.mocked(useRecorderEvents).mockReturnValueOnce((payload) => {
      return new RecorderEvent(payload, [handler]);
    });

    const onClickMeta = {
      action: 'click',
    };

    const handleOnClick = vi.fn();

    const EnhancedComponent = withRecorderEvents(ForwardedButton, {
      events: { onClick: onClickMeta },
      autoTrigger: true,
    });

    render(<EnhancedComponent onClick={handleOnClick} />);

    const button = screen.getByRole('button');

    const user = userEvent.setup();
    await user.click(button);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].payload).toEqual({ ...onClickMeta });
  });
});
