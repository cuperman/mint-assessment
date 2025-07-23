'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, AddressFormData } from '@/lib/schemas';
import { useWizardApi } from '@/context/WizardApiContext';
import { useWizard } from '@/context/WizardContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function AddressStep() {
  const { submitStepAndGetNext, isLoading } = useWizardApi();
  const { state, updateAddress } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: state.address?.street || '',
      city: state.address?.city || '',
      state: state.address?.state || '',
      zip: state.address?.zip || '',
    },
  });

  // Watch all form values for real-time updates
  const watchedValues = form.watch();

  // Save to wizard context whenever form values change
  useEffect(() => {
    const values = form.getValues();
    // Only update if values have actually changed to avoid infinite loops
    if (JSON.stringify(values) !== JSON.stringify(state.address)) {
      updateAddress(values);
    }
  }, [watchedValues, form, state.address, updateAddress]);

  // Update form when centralized state changes (e.g., when navigating back)
  useEffect(() => {
    if (state.address) {
      form.reset({
        street: state.address.street,
        city: state.address.city,
        state: state.address.state,
        zip: state.address.zip,
      });
    }
  }, [state.address, form]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      setIsSubmitting(true);
      const addressData = {
        address: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zip,
      };
      await submitStepAndGetNext(addressData);
    } catch (error) {
      console.error('Failed to submit address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Your Address</CardTitle>
        <CardDescription>
          Please provide your address to get an accurate quote for your HVAC
          installation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='street'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder='123 Main Street' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder='Austin' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='state'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder='TX' maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='zip'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder='78701' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={isLoading || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Continue Questionnaire'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
