import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { WizardApiProvider, useWizardApi } from '@/context/WizardApiContext'
import { WizardProvider } from '@/context/WizardContext'

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <WizardProvider>
    <WizardApiProvider>{children}</WizardApiProvider>
  </WizardProvider>
)

describe('WizardApiContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful session creation
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        sessionId: 'test-session', 
        currentStep: 1,
        data: {}
      }),
    })
  })

  it('provides wizard API context methods', () => {
    const { result } = renderHook(() => useWizardApi(), { wrapper: TestWrapper })
    
    // Should have the expected context methods
    expect(typeof result.current.submitStepAndGetNext).toBe('function')
    expect(typeof result.current.submitQuoteRequest).toBe('function')
    expect(typeof result.current.isLoading).toBe('boolean')
  })

  it('initializes session on mount', async () => {
    renderHook(() => useWizardApi(), { wrapper: TestWrapper })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/quote_request',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useWizardApi(), { wrapper: TestWrapper })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })
})
