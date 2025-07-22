'use client';

import { useWizardApi } from '@/context/WizardApiContext';
import { WizardProgress } from './WizardProgress';
import { AddressStep } from './AddressStep';
import { ACUnitsStep } from './ACUnitsStep';
import { SystemTypeStep } from './SystemTypeStep';
import { HeatingTypeStep } from './HeatingTypeStep';
import { ContactStep } from './ContactStep';
import { ConfirmationStep } from './ConfirmationStep';

export function WizardContainer() {
  const { currentStep, isLoading, error } = useWizardApi();

  if (isLoading && !currentStep) {
    return (
      <div className='min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Initializing wizard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-600 mb-4'>
            <svg
              className='h-12 w-12 mx-auto mb-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Something went wrong
          </h2>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
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
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            HVAC Quote Request
          </h1>
          <p className='text-gray-600'>
            Get a personalized quote for your HVAC installation
          </p>
        </div>

        <WizardProgress />
        {renderCurrentStep()}
      </div>
    </div>
  );
}
