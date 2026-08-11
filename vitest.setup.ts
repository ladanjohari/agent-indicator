// Adds the extra assertions that know about the DOM, so a test can say
// expect(dot).toBeInTheDocument() instead of checking for null by hand.
import '@testing-library/jest-dom/vitest'

import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Testing Library only tears down automatically when Vitest globals are on,
// and they are not. Without this every test renders into the same document and
// the second one finds two of everything.
afterEach(cleanup)
