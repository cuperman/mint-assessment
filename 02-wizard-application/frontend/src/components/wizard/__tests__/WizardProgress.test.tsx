import { render, screen } from '@testing-library/react'
import { WizardProgress } from '@/components/wizard/WizardProgress'
import { WizardApiProvider } from '@/context/WizardApiContext'
import { WizardProvider } from '@/context/WizardContext'

// Simple wrapper that provides necessary context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <WizardProvider>
    <WizardApiProvider>{children}</WizardApiProvider>
  </WizardProvider>
)

describe('WizardProgress', () => {
  beforeEach(() => {
    // Mock successful API calls
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        sessionId: 'test-session', 
        currentStep: 1,
        data: {}
      }),
    })
  })

  it('renders step information', async () => {
    render(
      <TestWrapper>
        <WizardProgress />
      </TestWrapper>
    )

    // Should show step information once loaded
    expect(await screen.findByText(/Step \d+ of 6/)).toBeInTheDocument()
  })

  it('renders progress bar', async () => {
    render(
      <TestWrapper>
        <WizardProgress />
      </TestWrapper>
    )

    // Check that progress component is rendered
    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
  })
})
