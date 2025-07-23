'use client';

import { useWizardApi } from '@/context/WizardApiContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Format phone number for display: 5551234567 -> (555) 123-4567
const formatPhoneForDisplay = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone; // Return as-is if not 10 digits
};
import { CheckCircle } from 'lucide-react';

export function ConfirmationStep() {
  const { sessionData, reset, quoteRequest } = useWizardApi();

  const handleStartOver = async () => {
    await reset();
  };

  // Use backend's completion status instead of calculating locally
  const isComplete = quoteRequest?.isQuestionnaireComplete ?? false;

  const formatACUnits = (units?: number) => {
    if (units === undefined || units === null) return 'Not specified';
    if (units === 0) return "I don't know";
    if (units === 1) return '1 AC Unit';
    if (units === 2) return '2 AC Units';
    if (units > 3) return 'More than 3 AC Units';
    return `${units} AC Units`;
  };

  const formatSystemType = (type?: string) => {
    if (!type) return 'Not specified';
    switch (type) {
      case 'split':
        return 'Split';
      case 'package':
        return 'Package';
      case 'i_dont_know':
        return "I don't know";
      default:
        return type;
    }
  };

  const formatHeatingType = (type?: string) => {
    if (!type) return 'Not specified';
    switch (type) {
      case 'heat_pump':
        return 'Heat pump';
      case 'gas':
        return 'Gas';
      case 'i_dont_know':
        return "I don't know";
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

          {sessionData?.data.address && (
            <div>
              <h4 className='font-medium text-gray-700'>Service Address:</h4>
              <p className='text-gray-600'>
                {sessionData.data.address.address}
                <br />
                {sessionData.data.address.city},{' '}
                {sessionData.data.address.state}{' '}
                {sessionData.data.address.zipCode}
              </p>
            </div>
          )}

          {sessionData?.data.acUnits && (
            <div>
              <h4 className='font-medium text-gray-700'>AC Units:</h4>
              <p className='text-gray-600'>
                {formatACUnits(sessionData.data.acUnits.units)}
              </p>
            </div>
          )}

          {sessionData?.data.systemType && (
            <div>
              <h4 className='font-medium text-gray-700'>System Type:</h4>
              <p className='text-gray-600'>
                {formatSystemType(sessionData.data.systemType.systemType)}
              </p>
            </div>
          )}

          {sessionData?.data.heatingType && (
            <div>
              <h4 className='font-medium text-gray-700'>Heating Type:</h4>
              <p className='text-gray-600'>
                {formatHeatingType(sessionData.data.heatingType.heatingType)}
              </p>
            </div>
          )}

          {sessionData?.data.contact && (
            <div>
              <h4 className='font-medium text-gray-700'>
                Contact Information:
              </h4>
              <p className='text-gray-600'>
                {sessionData.data.contact.firstName}{' '}
                {sessionData.data.contact.lastName}
                <br />
                {formatPhoneForDisplay(sessionData.data.contact.phone)}
                <br />
                {sessionData.data.contact.email}
              </p>
            </div>
          )}
        </div>

        <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
          <h4 className='font-medium text-blue-800 mb-2'>What&apos;s Next?</h4>
          <p className='text-blue-700 text-sm'>
            {isComplete
              ? 'One of our HVAC specialists will review your request and contact you within 24 hours to schedule a consultation and provide your personalized quote.'
              : 'One of our HVAC specialists will contact you within 24 hours to gather additional details about your system and provide your personalized quote.'}
          </p>
        </div>

        <div className='text-center pt-4'>
          <Button
            onClick={handleStartOver}
            variant='outline'
            className='w-full'
          >
            Submit Another Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
