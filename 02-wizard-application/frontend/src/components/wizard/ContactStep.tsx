'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/lib/schemas';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ContactStep() {
  const { state, setContact, goToNextStep, goToPrevStep } = useWizard();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: state.contact || {
      name: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setContact(data);
    // Here we would normally save to backend
    goToNextStep();
  };

  // Check if this is a contact-only flow (due to "I don't know" responses)
  const isContactOnly = state.needsContact;

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          {isContactOnly
            ? "We'll need your contact information so one of our specialists can help you with a personalized quote."
            : 'Please provide your contact information to complete your quote request.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isContactOnly && (
          <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='text-sm text-blue-800'>
              <strong>We'll contact you soon!</strong> Our HVAC specialists will reach out to
              discuss your specific needs and provide a personalized quote.
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder='John Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder='(555) 123-4567' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder='john@example.com' type='email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-3'>
              <Button type='button' variant='outline' onClick={goToPrevStep} className='flex-1'>
                Back
              </Button>
              <Button type='submit' className='flex-1'>
                {isContactOnly ? 'Submit Request' : 'Continue'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
