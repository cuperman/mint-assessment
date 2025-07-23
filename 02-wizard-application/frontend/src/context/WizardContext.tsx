'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  WizardData,
  AddressData,
  ACUnitsData,
  SystemTypeData,
  HeatingTypeData,
  ContactData,
} from '@/types/wizard';

type WizardAction =
  | { type: 'SET_ADDRESS'; payload: AddressData }
  | { type: 'SET_AC_UNITS'; payload: ACUnitsData }
  | { type: 'SET_SYSTEM_TYPE'; payload: SystemTypeData }
  | { type: 'SET_HEATING_TYPE'; payload: HeatingTypeData }
  | { type: 'SET_CONTACT'; payload: ContactData }
  | { type: 'UPDATE_ADDRESS'; payload: Partial<AddressData> }
  | { type: 'UPDATE_AC_UNITS'; payload: Partial<ACUnitsData> }
  | { type: 'UPDATE_SYSTEM_TYPE'; payload: Partial<SystemTypeData> }
  | { type: 'UPDATE_HEATING_TYPE'; payload: Partial<HeatingTypeData> }
  | { type: 'UPDATE_CONTACT'; payload: Partial<ContactData> }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'SET_NEEDS_CONTACT'; payload: boolean }
  | { type: 'RESET' };

interface WizardContextType {
  state: WizardData;
  dispatch: React.Dispatch<WizardAction>;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (step: number) => void;
  setAddress: (data: AddressData) => void;
  setACUnits: (data: ACUnitsData) => void;
  setSystemType: (data: SystemTypeData) => void;
  setHeatingType: (data: HeatingTypeData) => void;
  setContact: (data: ContactData) => void;
  updateAddress: (data: Partial<AddressData>) => void;
  updateACUnits: (data: Partial<ACUnitsData>) => void;
  updateSystemType: (data: Partial<SystemTypeData>) => void;
  updateHeatingType: (data: Partial<HeatingTypeData>) => void;
  updateContact: (data: Partial<ContactData>) => void;
  setNeedsContact: (needs: boolean) => void;
  reset: () => void;
  getNextStep: () => number;
}

const initialState: WizardData = {
  currentStep: 1,
  needsContact: false,
};

function getNextStepNumber(state: WizardData): number {
  const currentStep = state.currentStep;

  // Handle "I don't know" responses that should go to contact page
  if (state.needsContact) {
    return 5; // Contact step
  }

  switch (currentStep) {
    case 1: // Address -> AC Units
      return 2;
    case 2: // AC Units
      if (
        state.acUnits?.units === 'more_than_three' ||
        state.acUnits?.units === 'i_dont_know'
      ) {
        return 5; // Go to contact page
      }
      return 3; // Go to System Type
    case 3: // System Type
      if (state.systemType?.type === 'i_dont_know') {
        return 5; // Go to contact page
      }
      return 4; // Go to Heating Type
    case 4: // Heating Type
      if (state.heatingType?.type === 'i_dont_know') {
        return 5; // Go to contact page
      }
      return 5; // Go to Contact
    case 5: // Contact -> Confirmation
      return 6;
    case 6: // Confirmation (final)
      return 6;
    default:
      return currentStep + 1;
  }
}

function wizardReducer(state: WizardData, action: WizardAction): WizardData {
  switch (action.type) {
    case 'SET_ADDRESS':
      return {
        ...state,
        address: action.payload,
      };
    case 'UPDATE_ADDRESS':
      return {
        ...state,
        address: {
          ...state.address,
          ...action.payload,
        } as AddressData,
      };
    case 'SET_AC_UNITS':
      return {
        ...state,
        acUnits: action.payload,
        needsContact:
          action.payload.units === 'more_than_three' ||
          action.payload.units === 'i_dont_know',
      };
    case 'UPDATE_AC_UNITS':
      return {
        ...state,
        acUnits: {
          ...state.acUnits,
          ...action.payload,
        } as ACUnitsData,
      };
    case 'SET_SYSTEM_TYPE':
      return {
        ...state,
        systemType: action.payload,
        needsContact: action.payload.type === 'i_dont_know',
      };
    case 'UPDATE_SYSTEM_TYPE':
      return {
        ...state,
        systemType: {
          ...state.systemType,
          ...action.payload,
        } as SystemTypeData,
      };
    case 'SET_HEATING_TYPE':
      return {
        ...state,
        heatingType: action.payload,
        needsContact: action.payload.type === 'i_dont_know',
      };
    case 'UPDATE_HEATING_TYPE':
      return {
        ...state,
        heatingType: {
          ...state.heatingType,
          ...action.payload,
        } as HeatingTypeData,
      };
    case 'SET_CONTACT':
      return {
        ...state,
        contact: action.payload,
      };
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contact: {
          ...state.contact,
          ...action.payload,
        } as ContactData,
      };
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: getNextStepNumber(state),
      };
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
        needsContact: false, // Reset when going back
      };
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'SET_SESSION_ID':
      return {
        ...state,
        sessionId: action.payload,
      };
    case 'SET_NEEDS_CONTACT':
      return {
        ...state,
        needsContact: action.payload,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const getNextStep = () => getNextStepNumber(state);
  const goToNextStep = () => dispatch({ type: 'NEXT_STEP' });
  const goToPrevStep = () => dispatch({ type: 'PREV_STEP' });
  const goToStep = (step: number) =>
    dispatch({ type: 'SET_STEP', payload: step });
  const setAddress = (data: AddressData) =>
    dispatch({ type: 'SET_ADDRESS', payload: data });
  const setACUnits = (data: ACUnitsData) =>
    dispatch({ type: 'SET_AC_UNITS', payload: data });
  const setSystemType = (data: SystemTypeData) =>
    dispatch({ type: 'SET_SYSTEM_TYPE', payload: data });
  const setHeatingType = (data: HeatingTypeData) =>
    dispatch({ type: 'SET_HEATING_TYPE', payload: data });
  const setContact = (data: ContactData) =>
    dispatch({ type: 'SET_CONTACT', payload: data });
  const updateAddress = (data: Partial<AddressData>) =>
    dispatch({ type: 'UPDATE_ADDRESS', payload: data });
  const updateACUnits = (data: Partial<ACUnitsData>) =>
    dispatch({ type: 'UPDATE_AC_UNITS', payload: data });
  const updateSystemType = (data: Partial<SystemTypeData>) =>
    dispatch({ type: 'UPDATE_SYSTEM_TYPE', payload: data });
  const updateHeatingType = (data: Partial<HeatingTypeData>) =>
    dispatch({ type: 'UPDATE_HEATING_TYPE', payload: data });
  const updateContact = (data: Partial<ContactData>) =>
    dispatch({ type: 'UPDATE_CONTACT', payload: data });
  const setNeedsContact = (needs: boolean) =>
    dispatch({ type: 'SET_NEEDS_CONTACT', payload: needs });
  const reset = () => dispatch({ type: 'RESET' });

  const value: WizardContextType = {
    state,
    dispatch,
    goToNextStep,
    goToPrevStep,
    goToStep,
    setAddress,
    setACUnits,
    setSystemType,
    setHeatingType,
    setContact,
    updateAddress,
    updateACUnits,
    updateSystemType,
    updateHeatingType,
    updateContact,
    setNeedsContact,
    reset,
    getNextStep,
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
