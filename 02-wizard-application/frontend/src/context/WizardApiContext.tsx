'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { wizardApiService } from '@/lib/api';
import {
  QuoteRequest,
  UpdateQuoteRequest,
  SubmitQuoteRequestNew,
  ACUnitQuantity,
  SystemType,
  HeatingType,
  QuoteStatus,
  // Legacy imports for backward compatibility
  ContactData,
  StepData,
  SessionData,
} from '@/types/api';

interface WizardApiContextType {
  // New API state
  quoteRequest: QuoteRequest | null;
  isLoading: boolean;
  error: string | null;

  // New API methods
  createQuoteRequest: () => Promise<string | null>;
  getQuoteRequest: (sessionId: string) => Promise<QuoteRequest | null>;
  updateQuoteRequest: (
    sessionId: string,
    data: UpdateQuoteRequest,
  ) => Promise<QuoteRequest | null>;
  submitQuoteRequestNew: (
    sessionId: string,
    contactData: SubmitQuoteRequestNew,
  ) => Promise<QuoteRequest | null>;
  clearError: () => void;

  // Legacy API state and methods (for backward compatibility)
  sessionId: string | null;
  currentStep: number;
  sessionData: SessionData | null;
  initializeSession: () => Promise<void>;
  submitStepAndGetNext: (stepData: StepData) => Promise<number>;
  submitContactInfo: (contactData: { name: string; phone: string; email: string }) => Promise<boolean>;
  submitFinalQuote: (contactData: ContactData) => Promise<boolean>;
  loadSession: (sessionId: string) => Promise<void>;
  goToPrevStep: () => void;
  goToStep: (step: number) => void;
  submitQuoteRequest: (contactData: ContactData) => Promise<void>;
  reset: () => Promise<void>;
}

const WizardApiContext = createContext<WizardApiContextType | undefined>(
  undefined,
);

export function WizardApiProvider({ children }: { children: ReactNode }) {
  // New API state
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);

  // Legacy state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // Shared state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function for API calls
  const handleApiCall = async <T,>(
    apiCall: () => Promise<T>,
    onSuccess?: (result: T) => void,
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('API Error:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // New API methods
  const createQuoteRequest = async (): Promise<string | null> => {
    const result = await handleApiCall(
      () => wizardApiService.createQuoteRequest(),
      (response) => {
        const newQuoteRequest: QuoteRequest = {
          sessionId: response.sessionId,
          status: QuoteStatus.QUESTIONNAIRE,
        };
        setQuoteRequest(newQuoteRequest);
        setSessionId(response.sessionId); // Update legacy state too
      },
    );
    return result?.sessionId || null;
  };

  const getQuoteRequest = async (
    sessionId: string,
  ): Promise<QuoteRequest | null> => {
    return handleApiCall(
      () => wizardApiService.getQuoteRequest(sessionId),
      (response) => setQuoteRequest(response),
    );
  };

  const updateQuoteRequest = async (
    sessionId: string,
    data: UpdateQuoteRequest,
  ): Promise<QuoteRequest | null> => {
    return handleApiCall(
      () => wizardApiService.updateQuoteRequest(sessionId, data),
      (response) => setQuoteRequest(response),
    );
  };

  const submitQuoteRequestNew = async (
    sessionId: string,
    contactData: SubmitQuoteRequestNew,
  ): Promise<QuoteRequest | null> => {
    return handleApiCall(
      () => wizardApiService.submitQuoteRequest(sessionId, contactData),
      (response) => {
        setQuoteRequest(response);
        // Advance to confirmation step (step 6) after successful submission
        setCurrentStep(6);
      },
    );
  };

  const clearError = () => setError(null);

  // Legacy API methods
  const initializeSession = async () => {
    await createQuoteRequest();
  };

  const submitStepAndGetNext = async (stepData: StepData): Promise<number> => {
    if (!sessionId) {
      throw new Error('No session ID available');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await wizardApiService.submitNextStep({
        sessionId,
        currentStep,
        stepData,
      });

      // Simple logic: proceed to next step or jump to contact info
      const nextStep = response.nextStep;
      setCurrentStep(nextStep);

      // Always fetch updated session data to keep form in sync
      const updatedSession = await wizardApiService.getSession(sessionId);
      setSessionData(updatedSession);

      // Also update the raw quote request for completion status
      const updatedQuoteRequest = await wizardApiService.getQuoteRequest(sessionId);
      setQuoteRequest(updatedQuoteRequest);

      return nextStep;
    } catch (err) {
      // If 400 error, display on current page (don't change step)
      setError(err instanceof Error ? err.message : 'Failed to submit step');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const submitContactInfo = async (contactData: {
    name: string;
    phone: string;
    email: string;
  }): Promise<boolean> => {
    if (!sessionId) {
      throw new Error('No session ID available');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await wizardApiService.submitContactStep(sessionId, contactData);
      
      if (response.success && response.status === 'submitted') {
        setCurrentStep(6); // Go to confirmation
        
        // Update session data one final time
        const updatedSession = await wizardApiService.getSession(sessionId);
        setSessionData(updatedSession);
        
        // Also update the raw quote request
        const updatedQuoteRequest = await wizardApiService.getQuoteRequest(sessionId);
        setQuoteRequest(updatedQuoteRequest);
        
        return true;
      }
      
      return false;
    } catch (err) {
      // If 400 error, display on current page (step 5)
      setError(err instanceof Error ? err.message : 'Failed to submit contact info');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrevStep = () => {
    // Dead simple: always go to previous step, no matter what
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null); // Clear any errors when navigating
    }
  };

  const submitFinalQuote = async (
    contactData: ContactData,
  ): Promise<boolean> => {
    if (!sessionId) {
      throw new Error('No session ID available');
    }

    try {
      const response = await wizardApiService.submitQuoteRequestLegacy({
        sessionId,
        contactData,
      });
      return response.success;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit quote request',
      );
      return false;
    }
  };

  const loadSession = async (sessionId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const session = await wizardApiService.getSession(sessionId);
      setSessionData(session);
      setSessionId(sessionId);
      setCurrentStep(session.currentStep);
      
      // Also load the raw quote request
      const quoteRequest = await wizardApiService.getQuoteRequest(sessionId);
      setQuoteRequest(quoteRequest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const submitQuoteRequest = async (contactData: ContactData) => {
    if (!sessionId) {
      throw new Error('No session ID available');
    }

    try {
      setIsLoading(true);
      setError(null);

      await wizardApiService.submitQuoteRequestLegacy({
        sessionId,
        contactData,
      });

      // Fetch final session data
      const finalSession = await wizardApiService.getSession(sessionId);
      setSessionData(finalSession);

      // Advance to confirmation step (step 6) after successful submission
      setCurrentStep(6);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit quote request',
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = async () => {
    setQuoteRequest(null);
    setSessionId(null);
    setCurrentStep(1);
    setSessionData(null);
    setError(null);
    
    // Create a new session after reset
    try {
      console.log('Creating new session after reset...');
      const sessionId = await createQuoteRequest();
      console.log('New session created successfully with ID:', sessionId);
    } catch (err) {
      console.error('Failed to create new session after reset:', err);
      setError('Failed to create new session. Please refresh the page.');
    }
  };

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        console.log('Initializing session...');
        const sessionId = await createQuoteRequest();
        console.log('Session initialized successfully with ID:', sessionId);
      } catch (err) {
        console.error('Failed to initialize session:', err);
      }
    };

    initSession();
  }, []); // Only run on mount

  const value: WizardApiContextType = {
    // New API
    quoteRequest,
    isLoading,
    error,
    createQuoteRequest,
    getQuoteRequest,
    updateQuoteRequest,
    submitQuoteRequestNew,
    clearError,

    // Legacy API
    sessionId,
    currentStep,
    sessionData,
    initializeSession,
    submitStepAndGetNext,
    submitContactInfo,
    submitFinalQuote,
    loadSession,
    goToPrevStep,
    goToStep,
    submitQuoteRequest,
    reset,
  };

  return (
    <WizardApiContext.Provider value={value}>
      {children}
    </WizardApiContext.Provider>
  );
}

export function useWizardApi() {
  const context = useContext(WizardApiContext);
  if (context === undefined) {
    throw new Error('useWizardApi must be used within a WizardApiProvider');
  }
  return context;
}

// Helper functions to map between frontend form data and backend API format
export const mapAddressToUpdateRequest = (address: {
  street: string;
  city: string;
  state: string;
  zip: string;
}): UpdateQuoteRequest => ({
  street: address.street,
  city: address.city,
  state: address.state,
  zipCode: address.zip,
});

export const mapACUnitsToUpdateRequest = (acUnits: {
  units: '1' | '2' | 'more_than_three' | 'i_dont_know';
}): UpdateQuoteRequest => {
  let acUnitQuantity: ACUnitQuantity;
  switch (acUnits.units) {
    case '1':
      acUnitQuantity = ACUnitQuantity.ONE;
      break;
    case '2':
      acUnitQuantity = ACUnitQuantity.TWO;
      break;
    case 'more_than_three':
      acUnitQuantity = ACUnitQuantity.MORE_THAN_THREE;
      break;
    case 'i_dont_know':
      acUnitQuantity = ACUnitQuantity.I_DONT_KNOW;
      break;
    default:
      acUnitQuantity = ACUnitQuantity.I_DONT_KNOW;
  }
  return { acUnitQuantity };
};

export const mapSystemTypeToUpdateRequest = (systemType: {
  type: 'split' | 'package' | 'i_dont_know';
}): UpdateQuoteRequest => {
  let systemTypeEnum: SystemType;
  switch (systemType.type) {
    case 'split':
      systemTypeEnum = SystemType.SPLIT;
      break;
    case 'package':
      systemTypeEnum = SystemType.PACKAGE;
      break;
    case 'i_dont_know':
      systemTypeEnum = SystemType.I_DONT_KNOW;
      break;
    default:
      systemTypeEnum = SystemType.I_DONT_KNOW;
  }
  return { systemType: systemTypeEnum };
};

export const mapHeatingTypeToUpdateRequest = (heatingType: {
  type: 'heat_pump' | 'gas' | 'i_dont_know';
}): UpdateQuoteRequest => {
  let heatingTypeEnum: HeatingType;
  switch (heatingType.type) {
    case 'heat_pump':
      heatingTypeEnum = HeatingType.HEAT_PUMP;
      break;
    case 'gas':
      heatingTypeEnum = HeatingType.GAS;
      break;
    case 'i_dont_know':
      heatingTypeEnum = HeatingType.I_DONT_KNOW;
      break;
    default:
      heatingTypeEnum = HeatingType.I_DONT_KNOW;
  }
  return { heatingType: heatingTypeEnum };
};

export const mapContactToUpdateRequest = (contact: {
  name: string;
  phone: string;
  email: string;
}): UpdateQuoteRequest => ({
  contactName: contact.name,
  contactNumber: contact.phone.replace(/\D/g, ''), // Remove non-digits
  emailAddress: contact.email,
});
