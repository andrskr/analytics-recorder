type AutoTriggerPredicate<TEventName> = (eventName: TEventName) => boolean;
type AutoTriggerEventsInclude<TEventName> = {
  include: Set<TEventName> | AutoTriggerPredicate<TEventName>;
  exclude?: never;
};
type AutoTriggerEventsExclude<TEventName> = {
  exclude: Set<TEventName> | AutoTriggerPredicate<TEventName>;
  include?: never;
};

export type AutoTriggerEvents<TEventName> =
  | boolean
  | AutoTriggerEventsInclude<TEventName>
  | AutoTriggerEventsExclude<TEventName>;

function isAutoTriggerToggleOption<TEventName>(
  option: AutoTriggerEvents<TEventName>,
): option is boolean {
  return typeof option === 'boolean';
}

function isAutoTriggerIncludeOption<TEventName>(
  option: AutoTriggerEvents<TEventName>,
): option is AutoTriggerEventsInclude<TEventName> {
  return typeof option === 'object' && 'include' in option;
}

function isAutoTriggerExcludeOption<TEventName>(
  option: AutoTriggerEvents<TEventName>,
): option is AutoTriggerEventsExclude<TEventName> {
  return typeof option === 'object' && 'exclude' in option;
}

function shouldTriggerIfInclude<TEventName>(
  eventName: TEventName,
  option: AutoTriggerEventsInclude<TEventName>,
) {
  if (typeof option.include === 'function') {
    return option.include(eventName);
  }

  return option.include.has(eventName);
}

function shouldTriggerIfExclude<TEventName>(
  eventName: TEventName,
  option: AutoTriggerEventsExclude<TEventName>,
) {
  if (typeof option.exclude === 'function') {
    return !option.exclude(eventName);
  }

  return !option.exclude.has(eventName);
}

export function isAutoTriggered<TEventName>(
  eventName: TEventName,
  autoTriggerOption?: AutoTriggerEvents<TEventName>,
) {
  if (typeof autoTriggerOption === 'undefined') {
    return false;
  }

  if (isAutoTriggerToggleOption(autoTriggerOption)) {
    return autoTriggerOption;
  }

  if (isAutoTriggerIncludeOption(autoTriggerOption)) {
    return shouldTriggerIfInclude(eventName, autoTriggerOption);
  }

  if (isAutoTriggerExcludeOption(autoTriggerOption)) {
    return shouldTriggerIfExclude(eventName, autoTriggerOption);
  }

  return false;
}
