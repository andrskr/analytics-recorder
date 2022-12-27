import matchers, { type TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { expect, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

declare global {
  namespace Vi {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface JestAssertion<T = any>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }
}

expect.extend(matchers);
