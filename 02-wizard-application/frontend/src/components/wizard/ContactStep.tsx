'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/lib/schemas';
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
import { PhoneInput, getPhoneDigits } from '@/components/ui/phone-input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ContactStep() {
  const { submitContactInfo, goToPrevStep, quoteRequest, isLoading } =
    useWizardApi();
  const { state, updateContact } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use backend's completion status instead of calculating locally
  const isComplete = quoteRequest?.isQuestionnaireComplete ?? false;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: state.contact?.name || '',
      phone: state.contact?.phone || '',
      email: state.contact?.email || '',
    },
  });

  // Watch all form values for real-time updates
  const watchedValues = form.watch();

  // Save to wizard context whenever form values change
  useEffect(() => {
    const values = form.getValues();
    // Only update if values have actually changed to avoid infinite loops
    if (JSON.stringify(values) !== JSON.stringify(state.contact)) {
      updateContact(values);
    }
  }, [watchedValues, form, state.contact, updateContact]);

  // Update form when centralized state changes (e.g., when navigating back)
  useEffect(() => {
    if (state.contact) {
      form.reset({
        name: state.contact.name,
        phone: state.contact.phone,
        email: state.contact.email,
      });
    }
  }, [state.contact, form]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      // Ensure we send raw digits to the backend
      const phoneDigits = getPhoneDigits(data.phone);

      await submitContactInfo({
        name: data.name,
        phone: phoneDigits,
        email: data.email,
      });
    } catch (error) {
      console.error('Failed to submit contact info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          {isComplete
            ? 'Please provide your contact information to complete your quote request.'
            : "Please provide your contact information and we'll contact you to gather additional details for your quote."}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                    <PhoneInput value={field.value} onChange={field.onChange} />
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
                    <Input
                      placeholder='john@example.com'
                      type='email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={goToPrevStep}
                className='flex-1'
                disabled={isLoading || isSubmitting}
              >
                Back
              </Button>
              <Button
                type='submit'
                className='flex-1'
                disabled={isLoading || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
