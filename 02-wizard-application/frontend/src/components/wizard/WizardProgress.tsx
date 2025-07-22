'use client';

import { useWizardApi } from '@/context/WizardApiContext';
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
  const { currentStep } = useWizardApi();
  const progress = (currentStep / STEP_TITLES.length) * 100;

  return (
    <div className='w-full max-w-md mx-auto mb-8'>
      <div className='flex justify-between text-sm text-muted-foreground mb-2'>
        <span>
          Step {currentStep} of {STEP_TITLES.length}
        </span>
        <span>{STEP_TITLES[currentStep - 1]}</span>
      </div>
      <Progress value={progress} className='h-2' />
    </div>
  );
}
