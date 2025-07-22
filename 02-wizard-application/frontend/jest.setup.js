import '@testing-library/jest-dom'

// Suppress React 18 act() warnings in tests
const originalError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: An update to') &&
    args[0].includes('was not wrapped in act')
  ) {
    return
  }
  originalError.call(console, ...args)
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/test-path',
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Setup environment variables for tests
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001'
