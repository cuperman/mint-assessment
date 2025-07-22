import { render, screen, waitFor } from '@testing-library/react'
import { WizardProvider } from '@/context/WizardContext'
import { WizardApiProvider } from '@/context/WizardApiContext'
import { WizardContainer } from '@/components/wizard/WizardContainer'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <WizardApiProvider>
    <WizardProvider>{children}</WizardProvider>
  </WizardApiProvider>
)

describe('WizardContainer', () => {
  beforeEach(() => {
    // Reset fetch mock
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sessionId: 'test-session', currentStep: 1 }),
    })
  })

  it('loads and shows wizard content', async () => {
    render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('HVAC Quote Request')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Get a personalized quote for your HVAC installation')).toBeInTheDocument()
  })

  it('renders the wizard container after loading', async () => {
    render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('HVAC Quote Request')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Get a personalized quote for your HVAC installation')).toBeInTheDocument()
  })

  it('displays error state when there is an error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))

    render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('shows wizard progress component', async () => {
    render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/Step \d+ of \d+/)).toBeInTheDocument()
    })
  })
})
