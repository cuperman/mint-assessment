'use client';

import { useWizard } from '@/context/WizardContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export function ConfirmationStep() {
  const { state, reset } = useWizard();

  const handleStartOver = () => {
    reset();
  };

  const formatACUnits = (units: string) => {
    switch (units) {
      case '1':
        return '1 AC Unit';
      case '2':
        return '2 AC Units';
      case 'more-than-3':
        return 'More than 3 AC Units';
      case 'i-dont-know':
        return "I don't know how many units";
      default:
        return units;
    }
  };

  const formatSystemType = (type: string) => {
    switch (type) {
      case 'split':
        return 'Split System';
      case 'package':
        return 'Package System';
      case 'i-dont-know':
        return "I don't know the system type";
      default:
        return type;
    }
  };

  const formatHeatingType = (type: string) => {
    switch (type) {
      case 'heat-pump':
        return 'Heat Pump';
      case 'gas':
        return 'Gas Heating';
      case 'i-dont-know':
        return "I don't know the heating type";
      default:
        return type;
    }
  };

  return (
    <Card className='w-full max-w-lg mx-auto'>
      <CardHeader className='text-center'>
        <div className='flex justify-center mb-4'>
          <CheckCircle className='h-16 w-16 text-green-600' />
        </div>
        <CardTitle className='text-2xl text-green-700'>Thank You!</CardTitle>
        <CardDescription className='text-lg'>
          Your HVAC quote request has been submitted successfully.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='bg-gray-50 p-4 rounded-lg space-y-4'>
          <h3 className='font-semibold text-lg mb-3'>Request Summary:</h3>

          {state.address && (
            <div>
              <h4 className='font-medium text-gray-700'>Service Address:</h4>
              <p className='text-gray-600'>
                {state.address.street}
                <br />
                {state.address.city}, {state.address.state} {state.address.zip}
              </p>
            </div>
          )}

          {state.acUnits && (
            <div>
              <h4 className='font-medium text-gray-700'>AC Units:</h4>
              <p className='text-gray-600'>{formatACUnits(state.acUnits.units)}</p>
            </div>
          )}

          {state.systemType && (
            <div>
              <h4 className='font-medium text-gray-700'>System Type:</h4>
              <p className='text-gray-600'>{formatSystemType(state.systemType.type)}</p>
            </div>
          )}

          {state.heatingType && (
            <div>
              <h4 className='font-medium text-gray-700'>Heating Type:</h4>
              <p className='text-gray-600'>{formatHeatingType(state.heatingType.type)}</p>
            </div>
          )}

          {state.contact && (
            <div>
              <h4 className='font-medium text-gray-700'>Contact Information:</h4>
              <p className='text-gray-600'>
                {state.contact.name}
                <br />
                {state.contact.phone}
                <br />
                {state.contact.email}
              </p>
            </div>
          )}
        </div>

        <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
          <h4 className='font-medium text-blue-800 mb-2'>What's Next?</h4>
          <p className='text-blue-700 text-sm'>
            One of our HVAC specialists will review your request and contact you within 24 hours to
            schedule a consultation and provide your personalized quote.
          </p>
        </div>

        <div className='text-center pt-4'>
          <Button onClick={handleStartOver} variant='outline' className='w-full'>
            Submit Another Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
