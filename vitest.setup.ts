// Adds the extra assertions that know about the DOM, so a test can say
// expect(dot).toBeInTheDocument() instead of checking for null by hand.
import '@testing-library/jest-dom/vitest'
