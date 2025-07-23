import {
  CreateQuoteResponse,
  QuoteRequest,
  UpdateQuoteRequest,
  SubmitQuoteRequestNew,
  ACUnitQuantity,
  SystemType,
  HeatingType,
  // Legacy interfaces
  NextStepRequest,
  NextStepResponse,
  SubmitQuoteRequest,
  QuoteResponse,
  CreateSessionResponse,
  SessionData,
  AddressData,
  ACUnitsData,
  SystemTypeData,
  HeatingTypeData,
} from '@/types/api';

const API_BASE_URL = 'http://localhost:3001';

class WizardApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }

  // New REST API methods
  /**
   * Create a new quote request session
   * POST /api/quote_request
   */
  async createQuoteRequest(): Promise<CreateQuoteResponse> {
    return this.request<CreateQuoteResponse>('/api/quote_request', {
      method: 'POST',
    });
  }

  /**
   * Get quote request by session ID
   * GET /api/quote_request/:sessionId
   */
  async getQuoteRequest(sessionId: string): Promise<QuoteRequest> {
    return this.request<QuoteRequest>(`/api/quote_request/${sessionId}`);
  }

  /**
   * Update quote request with partial data
   * PATCH /api/quote_request/:sessionId
   */
  async updateQuoteRequest(
    sessionId: string,
    updateData: UpdateQuoteRequest,
  ): Promise<QuoteRequest> {
    return this.request<QuoteRequest>(`/api/quote_request/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Submit quote request with contact information
   * POST /api/quote_request/:sessionId
   */
  async submitQuoteRequest(
    sessionId: string,
    contactData: SubmitQuoteRequestNew,
  ): Promise<QuoteRequest> {
    return this.request<QuoteRequest>(`/api/quote_request/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // Legacy methods - kept for backward compatibility
  async createSession(): Promise<CreateSessionResponse> {
    const result = await this.createQuoteRequest();
    return { sessionId: result.sessionId };
  }

  async getSession(sessionId: string): Promise<SessionData> {
    const quoteRequest = await this.getQuoteRequest(sessionId);
    // Transform QuoteRequest to legacy SessionData format
    return {
      sessionId: quoteRequest.sessionId,
      currentStep: this.determineCurrentStep(quoteRequest),
      isCompleted: quoteRequest.status === 'submitted',
      data: {
        address: quoteRequest.street
          ? {
              address: quoteRequest.street,
              city: quoteRequest.city || '',
              state: quoteRequest.state || '',
              zipCode: quoteRequest.zipCode || '',
            }
          : undefined,
        acUnits: quoteRequest.acUnitQuantity
          ? {
              units: this.mapACUnitQuantityToNumber(
                quoteRequest.acUnitQuantity,
              ),
            }
          : undefined,
        systemType: quoteRequest.systemType
          ? {
              systemType: quoteRequest.systemType,
            }
          : undefined,
        heatingType: quoteRequest.heatingType
          ? {
              heatingType: quoteRequest.heatingType,
              hasExistingDucts: 'yes', // Default value
            }
          : undefined,
        contact: quoteRequest.contactName
          ? {
              firstName: quoteRequest.contactName.split(' ')[0] || '',
              lastName:
                quoteRequest.contactName.split(' ').slice(1).join(' ') || '',
              email: quoteRequest.emailAddress || '',
              phone: quoteRequest.contactNumber || '',
            }
          : undefined,
      },
    };
  }

  async submitNextStep(data: NextStepRequest): Promise<NextStepResponse> {
    const { sessionId, currentStep, stepData } = data;

    // Convert step data to UpdateQuoteRequest format
    let updateData: UpdateQuoteRequest = {};

    switch (currentStep) {
      case 1: // Address step
        if ('address' in stepData || 'street' in stepData) {
          const addressData = stepData as
            | AddressData
            | { street: string; city: string; state: string; zip: string };
          updateData = {
            street:
              'address' in addressData
                ? (addressData as AddressData).address
                : (addressData as { street: string }).street,
            city: addressData.city,
            state: addressData.state,
            zipCode:
              'zipCode' in addressData
                ? (addressData as AddressData).zipCode
                : (addressData as { zip: string }).zip,
          };
        }
        break;

      case 2: // AC Units step
        if ('units' in stepData) {
          const acUnitsData = stepData as
            | ACUnitsData
            | { units: string | number };
          let acUnitQuantity: ACUnitQuantity;
          const units = acUnitsData.units;

          if (units === 1 || units === '1') {
            acUnitQuantity = ACUnitQuantity.ONE;
          } else if (units === 2 || units === '2') {
            acUnitQuantity = ACUnitQuantity.TWO;
          } else if (units === 4 || units === 'more_than_three') {
            acUnitQuantity = ACUnitQuantity.MORE_THAN_THREE;
          } else if (units === 0 || units === 'i_dont_know') {
            acUnitQuantity = ACUnitQuantity.I_DONT_KNOW;
          } else {
            acUnitQuantity = ACUnitQuantity.I_DONT_KNOW; // Default fallback
          }

          updateData = { acUnitQuantity };
        }
        break;

      case 3: // System Type step
        if ('systemType' in stepData || 'type' in stepData) {
          const systemTypeData = stepData as SystemTypeData | { type: string };
          const typeValue =
            'systemType' in systemTypeData
              ? systemTypeData.systemType
              : (systemTypeData as { type: string }).type;

          let systemType: SystemType;
          switch (typeValue) {
            case 'split':
              systemType = SystemType.SPLIT;
              break;
            case 'package':
              systemType = SystemType.PACKAGE;
              break;
            default:
              systemType = SystemType.I_DONT_KNOW;
              break;
          }
          updateData = { systemType };
        }
        break;

      case 4: // Heating Type step
        if ('heatingType' in stepData || 'type' in stepData) {
          const heatingTypeData = stepData as
            | HeatingTypeData
            | { type: string };
          const typeValue =
            'heatingType' in heatingTypeData
              ? heatingTypeData.heatingType
              : (heatingTypeData as { type: string }).type;

          let heatingType: HeatingType;
          switch (typeValue) {
            case 'heat_pump':
              heatingType = HeatingType.HEAT_PUMP;
              break;
            case 'gas':
              heatingType = HeatingType.GAS;
              break;
            default:
              heatingType = HeatingType.I_DONT_KNOW;
              break;
          }
          updateData = { heatingType };
        }
        break;

      default:
        throw new Error(`Unsupported step: ${currentStep}`);
    }

    // Send data to server and get updated quote request
    const updatedQuoteRequest = await this.updateQuoteRequest(
      sessionId,
      updateData,
    );

    // Simple next step logic based on server response
    let nextStep: number;
    if (updatedQuoteRequest.status === 'contact_info') {
      nextStep = 5; // Jump to contact info step
    } else if (updatedQuoteRequest.status === 'questionnaire') {
      nextStep = currentStep + 1; // Proceed to next step
    } else {
      nextStep = 6; // Go to confirmation
    }

    return {
      nextStep,
      isComplete: nextStep >= 6,
      sessionId,
      updatedQuoteRequest, // Include the updated quote request data
    };
  }

  // Submit contact step (step 5) - uses POST to submit final quote
  async submitContactStep(
    sessionId: string,
    contactData: {
      name: string;
      phone: string;
      email: string;
    },
  ): Promise<{ success: boolean; status: string; quoteRequest: QuoteRequest }> {
    const submitData: SubmitQuoteRequestNew = {
      contactName: contactData.name,
      contactNumber: contactData.phone.replace(/\D/g, ''), // Remove non-digits
      emailAddress: contactData.email,
    };

    const quoteRequest = await this.submitQuoteRequest(sessionId, submitData);

    return {
      success: true,
      status: 'submitted',
      quoteRequest,
    };
  }

  async submitQuoteRequestLegacy(
    data: SubmitQuoteRequest,
  ): Promise<QuoteResponse> {
    try {
      // Convert ContactData to SubmitQuoteRequestNew format
      const submitData: SubmitQuoteRequestNew = {
        contactName:
          `${data.contactData.firstName} ${data.contactData.lastName}`.trim(),
        contactNumber: data.contactData.phone.replace(/\D/g, ''), // Remove non-digits
        emailAddress: data.contactData.email,
      };

      await this.submitQuoteRequest(data.sessionId, submitData);
      return {
        success: true,
        message: 'Quote request submitted successfully',
        quoteId: data.sessionId,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Helper methods
  private determineCurrentStep(quoteRequest: QuoteRequest): number {
    if (!quoteRequest.street) return 1; // Address step
    if (!quoteRequest.acUnitQuantity) return 2; // AC Units step
    if (!quoteRequest.systemType) return 3; // System Type step
    if (!quoteRequest.heatingType) return 4; // Heating Type step
    if (!quoteRequest.contactName) return 5; // Contact step
    return 6; // Summary/Complete
  }

  private mapACUnitQuantityToNumber(quantity: string): number {
    switch (quantity) {
      case '1':
        return 1;
      case '2':
        return 2;
      case '3':
        return 3;
      case 'more_than_three':
        return 4;
      case 'i_dont_know':
        return 0;
      default:
        return 0;
    }
  }
}

export const wizardApiService = new WizardApiService();
