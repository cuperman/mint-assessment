export interface AddressData {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface ACUnitsData {
  units: '1' | '2' | 'more-than-3' | 'i_dont_know';
}

export interface SystemTypeData {
  type: 'split' | 'package' | 'i_dont_know';
}

export interface HeatingTypeData {
  type: 'heat-pump' | 'gas' | 'i_dont_know';
}

export interface ContactData {
  name: string;
  phone: string;
  email: string;
}

export interface WizardData {
  address?: AddressData;
  acUnits?: ACUnitsData;
  systemType?: SystemTypeData;
  heatingType?: HeatingTypeData;
  contact?: ContactData;
  currentStep: number;
  sessionId?: string;
  needsContact?: boolean; // Flag for "I don't know" responses
}

export type WizardStep =
  | 'address'
  | 'ac-units'
  | 'system-type'
  | 'heating-type'
  | 'contact'
  | 'confirmation';

export interface WizardStepConfig {
  step: WizardStep;
  title: string;
  description: string;
  component: React.ComponentType<Record<string, unknown>>;
}
