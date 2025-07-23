'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/lib/schemas';
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
  const { sessionData, submitContactInfo, goToPrevStep, quoteRequest } =
    useWizardApi();

  // Use backend's completion status instead of calculating locally
  const isComplete = quoteRequest?.isQuestionnaireComplete ?? false;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: sessionData?.data.contact
      ? {
          name: `${sessionData.data.contact.firstName} ${sessionData.data.contact.lastName}`,
          phone: sessionData.data.contact.phone,
          email: sessionData.data.contact.email,
        }
      : {
          name: '',
          phone: '',
          email: '',
        },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Ensure we send raw digits to the backend
      const phoneDigits = getPhoneDigits(data.phone);

      await submitContactInfo({
        name: data.name,
        phone: phoneDigits,
        email: data.email,
      });
    } catch (error) {
      console.error('Failed to submit contact info:', error);
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
              >
                Back
              </Button>
              <Button type='submit' className='flex-1'>
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
