'use client';

import { useWizard } from '@/context/WizardContext';
import { Progress } from '@/components/ui/progress';

const STEP_TITLES = [
  'Address',
  'AC Units',
  'System Type',
  'Heating Type',
  'Contact Info',
  'Confirmation',
];

export function WizardProgress() {
  const { state } = useWizard();
  const progress = (state.currentStep / STEP_TITLES.length) * 100;

  return (
    <div className='w-full max-w-md mx-auto mb-8'>
      <div className='flex justify-between text-sm text-muted-foreground mb-2'>
        <span>
          Step {state.currentStep} of {STEP_TITLES.length}
        </span>
        <span>{STEP_TITLES[state.currentStep - 1]}</span>
      </div>
      <Progress value={progress} className='h-2' />

      {/* Show special message for contact-only flow */}
      {state.needsContact && state.currentStep === 5 && (
        <div className='mt-2 text-xs text-blue-600 text-center'>
          Specialist consultation required
        </div>
      )}
    </div>
  );
}
