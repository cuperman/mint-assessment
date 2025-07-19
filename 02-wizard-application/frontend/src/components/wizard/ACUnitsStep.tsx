'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { acUnitsSchema, ACUnitsFormData } from '@/lib/schemas';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const AC_UNIT_OPTIONS = [
  { value: '1', label: '1 AC Unit' },
  { value: '2', label: '2 AC Units' },
  { value: 'more-than-3', label: 'More than 3' },
  { value: 'i-dont-know', label: "I don't know" },
] as const;

export function ACUnitsStep() {
  const { state, setACUnits, goToNextStep, goToPrevStep } = useWizard();

  const form = useForm<ACUnitsFormData>({
    resolver: zodResolver(acUnitsSchema),
    defaultValues: state.acUnits || {
      units: undefined,
    },
  });

  const onSubmit = async (data: ACUnitsFormData) => {
    setACUnits(data);
    // Here we would normally save to backend and get next step from API
    goToNextStep();
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>AC Units</CardTitle>
        <CardDescription>How many AC units do you currently have in your home?</CardDescription>
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
                        <div key={option.value} className='flex items-center space-x-2'>
                          <RadioGroupItem value={option.value} id={option.value} />
                          <FormLabel htmlFor={option.value} className='cursor-pointer'>
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
              <Button type='button' variant='outline' onClick={goToPrevStep} className='flex-1'>
                Back
              </Button>
              <Button type='submit' className='flex-1'>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
