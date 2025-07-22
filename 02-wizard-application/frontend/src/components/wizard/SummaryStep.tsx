'use client';

import { useWizard } from '@/context/WizardContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function SummaryStep() {
  const { state, goToPrevStep, reset } = useWizard();

  const handleStartOver = () => {
    reset();
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>Here&apos;s what we&apos;ve collected so far:</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {state.address && (
          <div>
            <h3 className='font-semibold'>Address:</h3>
            <p className='text-sm text-muted-foreground'>
              {state.address.street}, {state.address.city},{' '}
              {state.address.state} {state.address.zip}
            </p>
          </div>
        )}

        {state.acUnits && (
          <div>
            <h3 className='font-semibold'>AC Units:</h3>
            <p className='text-sm text-muted-foreground'>
              {state.acUnits.units === '1' && '1 AC Unit'}
              {state.acUnits.units === '2' && '2 AC Units'}
              {state.acUnits.units === 'more-than-3' && 'More than 3 AC Units'}
              {state.acUnits.units === 'i-dont-know' && "I don't know"}
            </p>
          </div>
        )}

        <div className='flex gap-3 pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={goToPrevStep}
            className='flex-1'
          >
            Back
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={handleStartOver}
            className='flex-1'
          >
            Start Over
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
