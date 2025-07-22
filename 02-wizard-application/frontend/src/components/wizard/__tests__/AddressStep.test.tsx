import { render, screen } from '@testing-library/react'
import { AddressStep } from '@/components/wizard/AddressStep'
import { WizardApiProvider } from '@/context/WizardApiContext'
import { WizardProvider } from '@/context/WizardContext'

// Simple wrapper that provides necessary context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <WizardProvider>
    <WizardApiProvider>{children}</WizardApiProvider>
  </WizardProvider>
)

describe('AddressStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful API calls
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        sessionId: 'test-session', 
        currentStep: 1,
        data: { address: {} }
      }),
    })
  })

  it('renders address form fields', async () => {
    render(
      <TestWrapper>
        <AddressStep />
      </TestWrapper>
    )

    expect(await screen.findByLabelText(/street address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument()
  })

  it('renders the correct card title and description', async () => {
    render(
      <TestWrapper>
        <AddressStep />
      </TestWrapper>
    )

    expect(await screen.findByText('Your Address')).toBeInTheDocument()
    expect(screen.getByText(/please provide your address to get an accurate quote/i)).toBeInTheDocument()
  })

  it('shows continue button', async () => {
    render(
      <TestWrapper>
        <AddressStep />
      </TestWrapper>
    )

    expect(await screen.findByRole('button', { name: /continue/i })).toBeInTheDocument()
  })
})
