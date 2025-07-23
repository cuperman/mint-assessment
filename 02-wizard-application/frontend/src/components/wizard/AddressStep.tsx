'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, AddressFormData } from '@/lib/schemas';
import { useWizardApi } from '@/context/WizardApiContext';
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
  const { sessionData, submitStepAndGetNext, isLoading } = useWizardApi();

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: sessionData?.data.address
      ? {
          street: sessionData.data.address.address,
          city: sessionData.data.address.city,
          state: sessionData.data.address.state,
          zip: sessionData.data.address.zipCode,
        }
      : {
          street: '',
          city: '',
          state: '',
          zip: '',
        },
  });

  const onSubmit = async (data: AddressFormData) => {
    try {
      const addressData = {
        address: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zip,
      };
      await submitStepAndGetNext(addressData);
    } catch (error) {
      console.error('Failed to submit address:', error);
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

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Continue Questionnaire'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
