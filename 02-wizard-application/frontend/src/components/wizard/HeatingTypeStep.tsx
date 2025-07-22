'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { heatingTypeSchema, HeatingTypeFormData } from '@/lib/schemas';
import { useWizardApi } from '@/context/WizardApiContext';
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

const HEATING_TYPE_OPTIONS = [
  { value: 'heat-pump', label: 'Heat pump' },
  { value: 'gas', label: 'Gas' },
  { value: 'i_dont_know', label: "I don't know" },
] as const;

export function HeatingTypeStep() {
  const { sessionData, submitStepAndGetNext, goToPrevStep } = useWizardApi();

  const form = useForm<HeatingTypeFormData>({
    resolver: zodResolver(heatingTypeSchema),
    defaultValues: sessionData?.data.heatingType
      ? {
          type: sessionData.data.heatingType
            .heatingType as HeatingTypeFormData['type'],
        }
      : {
          type: undefined,
        },
  });

  const onSubmit = async (data: HeatingTypeFormData) => {
    try {
      const heatingTypeData = {
        heatingType: data.type,
        hasExistingDucts: 'yes', // Default value, could be made dynamic
        customHeatingType: data.type === 'i_dont_know' ? undefined : data.type,
      };
      await submitStepAndGetNext(heatingTypeData);
    } catch (error) {
      console.error('Failed to submit heating type:', error);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Heating Type</CardTitle>
        <CardDescription>
          What type of heating system do you prefer or currently have?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>Heating Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className='grid grid-cols-1 gap-3'
                    >
                      {HEATING_TYPE_OPTIONS.map((option) => (
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
              >
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
