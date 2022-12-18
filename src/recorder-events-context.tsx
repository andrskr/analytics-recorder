import { treePropCollector } from './tree-prop-collector';

export type ContextValue = Record<string, unknown>;

export const [RecorderEventsContext, useGetContextValues] =
  treePropCollector<ContextValue>('RecorderEventsContext');
