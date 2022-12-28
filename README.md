# Analytics Recorder

Analytics Recorder is a lightweight, typesafe solution for tracking user behavior and performance data in real-time using React Components and Hooks. It is hugely inspired by [Atlaskit Analytics](https://atlaskit.atlassian.com/packages/analytics/analytics-next), a well-known library for tracking analytics data, and shares many of its features and capabilities.

## **Overview**

With Analytics Recorder, developers can easily track user interactions, events, and page views and use this data to understand how users are interacting with their applications and to identify areas for improvement.

Analytics Recorder is optimized for performance, making it well-suited for use in applications where size and speed are important considerations. It is decoupled from Atlaskit's specific code and is more generic, making it easier to use with a wider range of applications and tools. Additionally, it includes strong type-checking to ensure that variables are used correctly and consistently throughout the code, helping to prevent errors and improve reliability and maintainability. It also uses JavaScript Proxy and WeakMap to intercept function calls and track enhanced props, respectively, in order to optimize performance and maintain type safety without changing the original function signature or causing unnecessary re-renders.

## How can it be useful?

The Analytics Recorder library is a tool that allows developers to track and record user interactions with a web application. It provides a way to create custom events and trigger them at specific points in the application's lifecycle and listen for and handle these events.

There are several use cases where this library could be helpful:

1. Tracking user engagement: By recording events such as clicks, page views, and form submissions, developers can get a better understanding of how users are interacting with their applications. This information can be used to improve the user experience and optimize the application's performance.
2. A/B testing: By recording events and the context in which they occurred, developers can easily compare the performance of different versions of their application and determine which version performs best.
3. Personalization: By recording events and the context in which they occurred, developers can create a more personalized experience for their users by adapting the application to their preferences and behavior.
4. Analytics: By recording events and the context in which they occurred, developers can use this data to create reports and gain insights into their application's performance and user behavior.

## **Features**

- Lightweight and performant: the library is designed to be small and efficient, making it well-suited for use in applications where size and speed are important considerations.
- Typesafe: includes strong type checking to ensure that variables are used correctly and consistently throughout the code, helping to prevent errors and improve reliability and maintainability.
- Decoupled and generic: decoupled from Atlaskit's specific code and is more generic, making it easier to use with a wider range of applications and tools.
- Real-time tracking: allows developers to track user interactions, events, and page views in real-time, helping to provide a more accurate and up-to-date understanding of user behavior.
- Custom metrics: allows developers to track custom metrics and site data, providing even more detailed and specific insights into user behavior and performance.
- No dependencies: has no dependencies, making it easy to incorporate into any project.
- Optimized for React: includes React Components and Hooks, making it easy to integrate into React-based applications.
- JavaScript Proxy and WeakMap: Our library uses JavaScript Proxy and WeakMap to intercept function calls and track enhanced props, respectively.

## **Getting Started**

### **Installation**

To install Analytics Recorder, run the following command in your project directory using either npm, yarn, or pnpm:

```bash
# Using npm
npm install analytics-recorder

# Using yarn
yarn add analytics-recorder

# Using pnpm
pnpm add analytics-recorder
```

### **Usage**

To start using the library, you'll need to wrap your application or a part of it with the `RecorderEventsListener` component. This component will listen to all events triggered within the wrapped tree and pass them to the `onEvent` prop.

```tsx
import { RecorderEventsListener } from 'analytics-recorder';

function App() {
  const handleRecorderEvents = (recorderEvent) => {
    console.log('Recorded Event', recorderEvent);
  };

  return (
    <RecorderEventsListener onEvent={handleRecorderEvents} channel={CATCH_ALL_CHANNEL}>
      {/* Your application code goes here */}
    </RecorderEventsListener>
  );
}
```

You can also specify a channel to listen to events from. In this case, the `CATCH_ALL_CHANNEL` is used, which listens to all triggered events.

You can use the `withRecorderEvents` higher-order component to wrap your components and specify the events you want to trigger with event metadata.

```tsx
import { withRecorderEvents, type RecorderEvent } from 'analytics-recorder';

const AnalyticalButton = withRecorderEvents(Button, {
  onClick: {
    action: 'click',
  },
});

function App() {
  const handleRecorderEvents = (recorderEvent) => {
    console.log('Recorded Event', recorderEvent);
  };

  const handleClick = useCallback((_: unknown, recorderEvent: RecorderEvent) => {
    recorderEvent.trigger();
  }, []);

  return (
    <RecorderEventsListener onEvent={handleRecorderEvents} channel={CATCH_ALL_CHANNEL}>
      <AnalyticalButton onClick={handleClick}>Click me</AnalyticalButton>
    </RecorderEventsListener>
  );
}
```

In this example, every time the button is clicked, an event with the `click` action will be triggered.

You can also use the `useRecorderEventsCallback` hook to trigger events from your functional components.

```tsx
import { useRecorderEventsCallback } from 'analytics-recorder';

function AnalyticalButton({ onClick }: AnalyticalButtonProps) {
  const handleClick = useRecorderEventsCallback(
    onClick,
    useMemo(() => ({ action: 'click', element: 'button' }), []),
  );

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}
```

To add some additional contextual information for your events, you can wrap your application or a part of it with the `RecorderEventsContext` component. This component will add contextual information to all events triggered within the wrapped tree. If an event is triggered wrapped by several `RecorderEventsContext`, then this event will receive all contextual values for these components.

```tsx
const eventContext = { container: 'app' };

const App = () => (
  <RecorderEventsListener onEvent={handleRecorderEvents} channel={CATCH_ALL_CHANNEL}>
    <RecorderEventsContext value={eventContext}>
      {/* Your application code goes here */}
    </RecorderEventsContext>
  </RecorderEventsListener>
);
```

You can use the `withEventsContext` higher-order component to provide additional contextual information for recorded events:

```tsx
const ContextualAnalyticalButton = withEventsContext({ withEventsContext: true })(AnalyticalButton);
```

That's it! You're now ready to use this library to record events in your application.

## API & Examples

### RecorderEvent

The `RecorderEvent` class represents an event that can be triggered and captured by `RecorderEventListener` components. It contains a payload of data that can be accessed and modified by calling the `update` method. When the `trigger` method is called, it will notify all registered listeners of the event, passing them the `RecorderEvent` instance and an optional channel identifier. Listeners can use the event's payload and context data to determine how to handle the event.

Using the `update` method of the `RecorderEvent` instance, you can add additional information to the payload of the event. This can be useful for adding context to the event that is not available at the time the event is created.

For example, include the current date and time in the event payload to know when the event occurred. You can do this by using the `update` method as shown in the example below:

```tsx
import { withRecorderEvents, type RecorderEvent } from 'analytics-recorder';

const AnalyticalButton = withRecorderEvents(Button, {
  onClick: {
    action: 'click',
  },
});

function App() {
  const handleRecorderEvents = (recorderEvent) => {
    console.log('Recorded Event', recorderEvent);
  };

  const handleClick = useCallback((_: unknown, recorderEvent: RecorderEvent) => {
    recorderEvent.update((prev) => ({ ...prev, triggeredAt: new Date().toISOString() })).trigger();
  }, []);

  return (
    <RecorderEventsListener onEvent={handleRecorderEvents} channel={CATCH_ALL_CHANNEL}>
      <AnalyticalButton onClick={handleClick}>Click me</AnalyticalButton>
    </RecorderEventsListener>
  );
}
```

In this example, we are using the `update` method to add the current date and time to the event payload under the `triggeredAt` key. The `update` method takes a function that receives the previous payload and returns the updated payload. We can then use the `trigger` method to send the updated event to the listeners.

This can be useful for adding context to the event that was not available at the time the event was created, such as the current date and time, or information about the user that triggered the event.

The update method can be called with an object that will shallowly merge the existing payload with the provided object. For example, you can update the payload of a `RecorderEvent` with a new value:

```tsx
import { withRecorderEvents, type RecorderEvent } from 'analytics-recorder';

const AnalyticalButton = withRecorderEvents(Button, {
  onClick: {
    action: 'click',
  },
});

function App() {
  const handleRecorderEvents = (recorderEvent) => {
    console.log('Recorded Event', recorderEvent);
  };

  const handleClick = useCallback((_: unknown, recorderEvent: RecorderEvent) => {
    // update the payload of the RecorderEvent by merging in a new value
    recorderEvent.update({ triggeredAt: new Date().toISOString() }).trigger();
  }, []);

  return (
    <RecorderEventsListener onEvent={handleRecorderEvents} channel={CATCH_ALL_CHANNEL}>
      <AnalyticalButton onClick={handleClick}>Click me</AnalyticalButton>
    </RecorderEventsListener>
  );
}
```

In this example, when the button is clicked, the `handleClick` callback is invoked and the `update` method is called on the RecorderEvent. The provided object `{ triggeredAt: new Date().toISOString() }` is merged with the existing payload, adding a new field `triggeredAt` with the current date and time as a string. The updated RecorderEvent is then triggered by calling the `trigger` method. This will cause the RecorderEvent to be passed to any listeners subscribed to the specified channel (in this case, the catch-all channel).

The `RecorderEvent` class has a `trigger` method that can be used to invoke all the listeners that are registered to listen to events on a specific channel. The `trigger` method accepts an optional `channel` argument, which can be a string or the special `CATCH_ALL_CHANNEL` symbol. If a `channel` is specified, only the listeners that are registered to listen to events on that channel will be invoked. If no `channel` is specified, or if the `CATCH_ALL_CHANNEL` symbol is used as the `channel`, all the listeners that are registered to listen to events on any channel will be invoked.

Here is an example of how you can use the `trigger` method:

```tsx
import { CATCH_ALL_CHANNEL } from 'analytics-recorder';

const myRecorderEvent = new RecorderEvent({ action: 'myAction' });

// Trigger the event on the CATCH_ALL_CHANNEL
myRecorderEvent.trigger(CATCH_ALL_CHANNEL);

// Trigger the event on a specific channel
myRecorderEvent.trigger('myChannel');
```

In this example, the `myRecorderEvent` event will be triggered on the `CATCH_ALL_CHANNEL` and on the `myChannel` channel. All the listeners that are registered to listen to events on either of these channels will be invoked.

### useRecorderEvents

`useRecorderEvents` is a hook that returns a function that can be used to create a new `RecorderEvent` object. The `RecorderEvent` object allows you to trigger an event and update the payload associated with the event.

An example of how `useRecorderEvents` could be used is shown below:

```tsx
import { useRecorderEvents } from 'analytics-recorder';

function MyComponent() {
  const createRecorderEvent = useRecorderEvents();

  const handleClick = () => {
    const event = createRecorderEvent({ action: 'click' });
    event.trigger();
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

In this example, the `createRecorderEvent` function is used to create a new `RecorderEvent` object when the button is clicked. The `RecorderEvent` object is then triggered, which will trigger the event for listeners.

### RecorderEventsListener

`RecorderEventsListener` is a component that allows you to register a callback function to be invoked whenever a `RecorderEvent` is triggered within its children tree. It accepts a `channel` prop, which allows you to specify a channel for the events that you want to listen to. If a `channel` is not specified, it will listen to all events by default (triggered without any event specified). When an event is triggered, the `onEvent` callback function that you provide will be invoked with the `RecorderEvent` object as an argument.

### RecorderEventsContext

The `RecorderEventsContext` is a React context that allows components to pass contextual information down the component tree to be accessed by `RecorderEvent` instances. When a `RecorderEvent` is created, it can optionally be given a reference to the current context values through the `context` parameter in its constructor. These values can then be accessed on the `RecorderEvent` instance through the `context` property and used to augment the event payload or to be used in some other way.

One use case for the `RecorderEventsContext` in combination with `RecorderEvent` is to add additional metadata to events that are triggered within a certain part of the component tree. For example, consider a scenario where you have a set of components that represent a page on a website, and you want to track user interactions with these components as events. You can wrap the root component of the page with a `RecorderEventsContext` and pass in an object containing metadata about the page, such as its URL or the user's language preference. Then, when a `RecorderEvent` is triggered within this part of the tree, it will have access to this metadata and can include it in the event payload. This can be useful for identifying and grouping events based on the context in which they occurred.

### withEventsContext

`withEventsContext` is a higher-order component that wraps a provided component and adds a `RecorderEventsContext` component to its tree. This allows the wrapped component and all of its descendants to have access to the context value provided to `withEventsContext`.

One advantage of using `withEventsContext` is that it allows you to set the context value for a component and all of its descendants without having to wrap each component with a `RecorderEventsContext` component manually.

In comparison, `RecorderEventsContext` is a lower-level component that simply provides a context value to its children. If you only need to provide a context value to a small number of components or if you need more control over which components have access to the context value, you might prefer to use `RecorderEventsContext` directly.

### useRecorderEventsCallback

`useRecorderEventsCallback` is a React hook that returns a new callback function that has a `RecorderEvent` as its last argument. This can be useful if you want to create a `RecorderEvent` and pass it to a callback function in a declarative way.

Here's an example of how you can use `useRecorderEventsCallback` to create a `RecorderEvent` and pass it to a callback function:

```tsx
import { useRecorderEventsCallback } from 'analytics-recorder';

function MyComponent() {
  const handleClick = useRecorderEventsCallback(
    (event, recorderEvent) => {
      // Do something with the click event and the recorder event
      console.log(event, recorderEvent);
    },
    { action: 'click' },
  );

  return <button onClick={handleClick}>Click me</button>;
}
```

In this example, the `handleClick` callback function will be called with a `RecorderEvent` as its last argument whenever the button is clicked. The `RecorderEvent` will have an `action` property with a value of `'click'`.

The `useRecorderEventsCallback` hook can be used to create a new callback function that will automatically create a `RecorderEvent` and pass it as the last argument to the original callback when invoked. This can be useful when you want to decorate a component's props with this behavior, for example:

```tsx
import { useRecorderEventsCallback } from 'react-recorder-events';

function MyComponent({ onClick }) {
  const handleClick = useRecorderEventsCallback(onClick, {
    action: 'click',
  });

  return <button onClick={handleClick}>Click me</button>;
}
```

In this example, the `handleClick` callback created by `useRecorderEventsCallback`
will create a `RecorderEvent` with the `{ action: 'click' }` payload when it is invoked, and pass it as the last argument to the original `onClick` callback. This allows you to add additional behavior, such as triggering the event or updating the payload, without modifying the original callback.

### withRecorderEvents

The `withRecorderEvents` function is a higher-order component (HOC) that allows you to enhance a given React component with the ability to add `RecorderEvent` object on certain events handlers.

To use `withRecorderEvents`, you pass it a React component and an options object that specifies which events you want to enhance and how you want to enhance them. The resulting HOC will return a new component that has the desired event enhancements.

For example, let's say you have a simple button component, and you want to add a `RecorderEvent` with the action `'click'` whenever the button is clicked. You could use `withRecorderEvents` like this:

```tsx
import { withRecorderEvents } from 'my-recorder-events-library';

const EnhancedButton = withRecorderEvents(Button, {
  events: {
    onClick: {
      action: 'click',
    },
  },
});
```

Now, when you use the `EnhancedButton` component, it will add a `RecorderEvent` with the action `'click'` to the `onClick` event handler as the last argument whenever it is clicked.

You can also pass a function as the value for an event in the `events` object. This function will be called with the `createRecorderEvent` function and the component's props, and it should return a `RecorderEvent` object. This can be useful if you want to customize the `RecorderEvent` based on the component's props.

For example:

```tsx
const EnhancedButton = withRecorderEvents(Button, {
  events: {
    onClick: (create, props) =>
      create({
        action: 'click',
        label: props.label,
      }),
  },
});
```

The `withRecorderEvents` function also accepts an optional `autoTrigger` property in the options object. This property can be an object or a boolean. If it is an object, you can specify which events should be automatically triggered by setting the `include` or `exclude` property to a set of event names. If it is a boolean, it will enable or disable automatic triggering for all events.

For example:

```tsx
const EnhancedButton = withRecorderEvents(Button, {
  events: {
    onClick: {
      action: 'click',
    },
    onMouseOut: {
      action: 'mouseOut',
    },
  },
  autoTrigger: {
    include: new Set(['onClick']),
  },
});
```

This will automatically trigger a `RecorderEvent` with the action `'click'` whenever the button is clicked, but it will not automatically trigger a `RecorderEvent` with the action `'mouseOut'` when the mouse leaves the button.

You can also specify a `channel` property in the options object to specify which `RecorderEvent` channel the enhanced events should be triggered on.

In the `withRecorderEvents` higher-order component, the `autoTrigger` option is disabled by default, meaning that events will not be automatically triggered when they are fired. This means that you must manually trigger the events using the `trigger` method on the `RecorderEvent` object that is passed as an argument to the event handler.

This allows you to have more control over when and how the events are triggered and can be useful if you want to add additional information to the event using the `update` method before triggering it.

There is only one situation where you can use auto-triggering - when you want to trigger an event as soon as it occurs, without waiting for any other action to occur. For example, you might want to trigger a "click" event as soon as a button is clicked rather than waiting for a parent component to handle the event.

It is generally a good idea to disable auto-triggering for reusable components, and let the parent components decide what they want to do with the events. This allows the parent components to have more control over the event triggering behavior and can make the components more flexible and easier to use in different contexts.

The `autoTrigger` option in `withRecorderEvents` allows you to specify whether or not to automatically trigger a `RecorderEvent` when an event occurs in the wrapped component. It can be configured in one of three ways:

1. As a boolean value: If set to `true`, any events that occur in the wrapped component will automatically trigger a `RecorderEvent`. If set to `false`, no events will be automatically triggered.
2. As an object with an `include` property: This allows you to specify a set of event names or a predicate function that will be used to determine which events should be automatically triggered. If the `eventName` passed to the predicate function or contained in the set, the `RecorderEvent` will be triggered.
3. As an object with an `exclude` property: This allows you to specify a set of event names or a predicate function that will be used to determine which events should not be automatically triggered. If the `eventName` is not contained in the set or returns `false` when passed to the predicate function, the `RecorderEvent` will be triggered.

For example, you might use the `autoTrigger` option like this:

```tsx
withRecorderEvents(Button, {
  events: {
    onClick: {
      action: 'click',
    },
    onBlur: {
      action: 'blur',
    },
  },
  autoTrigger: true, // all events (onClick and onBlur) will trigger a RecorderEvent
});

withRecorderEvents(Button, {
  events: {
    onClick: {
      action: 'click',
    },
    onBlur: {
      action: 'blur',
    },
  },
  autoTrigger: {
    include: new Set(['click']), // only clicks will trigger a RecorderEvent
  },
});

withRecorderEvents(Button, {
  events: {
    onClick: {
      action: 'click',
    },
    onBlur: {
      action: 'blur',
    },
  },
  autoTrigger: {
    exclude: (eventName) => eventName === 'onClick', // // only onBlur will trigger a RecorderEvent
  },
});
```
