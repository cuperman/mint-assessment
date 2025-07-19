'use client';

import { useWizard } from '@/context/WizardContext';
import { WizardProgress } from './WizardProgress';
import { AddressStep } from './AddressStep';
import { ACUnitsStep } from './ACUnitsStep';
import { SystemTypeStep } from './SystemTypeStep';
import { HeatingTypeStep } from './HeatingTypeStep';
import { ContactStep } from './ContactStep';
import { ConfirmationStep } from './ConfirmationStep';

export function WizardContainer() {
  const { state } = useWizard();

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return <AddressStep />;
      case 2:
        return <ACUnitsStep />;
      case 3:
        return <SystemTypeStep />;
      case 4:
        return <HeatingTypeStep />;
      case 5:
        return <ContactStep />;
      case 6:
        return <ConfirmationStep />;
      default:
        return <AddressStep />;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>HVAC Quote Request</h1>
          <p className='text-gray-600'>Get a personalized quote for your HVAC installation</p>
        </div>

        <WizardProgress />
        {renderCurrentStep()}
      </div>
    </div>
  );
}
