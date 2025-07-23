'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { acUnitsSchema, ACUnitsFormData } from '@/lib/schemas';
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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const AC_UNIT_OPTIONS = [
  { value: '1', label: '1 AC Unit' },
  { value: '2', label: '2 AC Units' },
  { value: 'more_than_three', label: 'More than 3' },
  { value: 'i_dont_know', label: "I don't know" },
] as const;

export function ACUnitsStep() {
  const { submitStepAndGetNext, goToPrevStep, isLoading } = useWizardApi();
  const { state, updateACUnits } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ACUnitsFormData>({
    resolver: zodResolver(acUnitsSchema),
    defaultValues: {
      units: state.acUnits?.units,
    },
  });

  // Watch all form values for real-time updates
  const watchedValues = form.watch();

  // Save to wizard context whenever form values change
  useEffect(() => {
    const values = form.getValues();
    // Only update if values have actually changed to avoid infinite loops
    if (JSON.stringify(values) !== JSON.stringify(state.acUnits)) {
      updateACUnits(values);
    }
  }, [watchedValues, form, state.acUnits, updateACUnits]);

  // Update form when centralized state changes (e.g., when navigating back)
  useEffect(() => {
    if (state.acUnits) {
      form.reset({
        units: state.acUnits.units,
      });
    }
  }, [state.acUnits, form]);

  const onSubmit = async (data: ACUnitsFormData) => {
    try {
      setIsSubmitting(true);
      let units: number;

      if (data.units === '1') units = 1;
      else if (data.units === '2') units = 2;
      else if (data.units === 'more_than_three')
        units = 4; // Use 4 to represent "more than 3"
      else if (data.units === 'i_dont_know') units = 0; // "I don't know" case
      else units = 0; // Default fallback

      const acUnitsData = { units };
      await submitStepAndGetNext(acUnitsData);
    } catch (error) {
      console.error('Failed to submit AC units:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>AC Units</CardTitle>
        <CardDescription>
          How many AC units do you currently have in your home?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='units'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>Number of AC Units</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className='grid grid-cols-1 gap-3'
                    >
                      {AC_UNIT_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className='flex items-center space-x-2'
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                          />
                          <FormLabel
                            htmlFor={option.value}
                            className='cursor-pointer'
                          >
                            {option.label}
                          </FormLabel>
                        </div>
                      ))}
                    </RadioGroup>
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
                {isSubmitting ? 'Submitting...' : 'Continue'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
