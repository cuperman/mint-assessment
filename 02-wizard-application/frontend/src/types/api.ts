// Backend DTO enums - keep in sync with backend
export enum ACUnitQuantity {
  ONE = '1',
  TWO = '2',
  MORE_THAN_THREE = 'more_than_three',
  I_DONT_KNOW = 'i_dont_know',
}

export enum SystemType {
  SPLIT = 'split',
  PACKAGE = 'package',
  I_DONT_KNOW = 'i_dont_know',
}

export enum HeatingType {
  HEAT_PUMP = 'heat_pump',
  GAS = 'gas',
  I_DONT_KNOW = 'i_dont_know',
}

export enum QuoteStatus {
  QUESTIONNAIRE = 'questionnaire',
  CONTACT_INFO = 'contact_info',
  SUBMITTED = 'submitted',
}

// Frontend form data interfaces (legacy - for internal component use)
export interface AddressData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ACUnitsData {
  units: number;
}

export interface SystemTypeData {
  systemType: string;
  customType?: string;
}

export interface HeatingTypeData {
  heatingType: string;
  hasExistingDucts: string;
  customHeatingType?: string;
}

export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// New API interface for final submission
export interface SubmitQuoteRequestNew {
  contactName: string;
  contactNumber: string;
  emailAddress: string;
}

// Backend API interfaces - matches backend DTO
export interface QuoteRequest {
  sessionId: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  acUnitQuantity?: ACUnitQuantity;
  systemType?: SystemType;
  heatingType?: HeatingType;
  contactName?: string;
  contactNumber?: string;
  emailAddress?: string;
  status: QuoteStatus;
  isQuestionnaireComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Union type for step data (legacy - for internal component use)
export type StepData =
  | AddressData
  | ACUnitsData
  | SystemTypeData
  | HeatingTypeData
  | ContactData;

// New API interfaces for REST endpoints
export interface CreateQuoteResponse {
  sessionId: string;
}

export interface UpdateQuoteRequest {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  acUnitQuantity?: ACUnitQuantity;
  systemType?: SystemType;
  heatingType?: HeatingType;
  contactName?: string;
  contactNumber?: string;
  emailAddress?: string;
}

// Legacy interfaces - kept for backward compatibility
export interface NextStepRequest {
  sessionId: string;
  currentStep: number;
  stepData: StepData;
}

export interface NextStepResponse {
  nextStep: number;
  isComplete: boolean;
  sessionId: string;
}

export interface SubmitQuoteRequest {
  sessionId: string;
  contactData: ContactData;
}

export interface QuoteResponse {
  success: boolean;
  message: string;
  quoteId?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
}

export interface SessionData {
  sessionId: string;
  currentStep: number;
  isCompleted: boolean;
  data: {
    address?: AddressData;
    acUnits?: ACUnitsData;
    systemType?: SystemTypeData;
    heatingType?: HeatingTypeData;
    contact?: ContactData;
  };
}
