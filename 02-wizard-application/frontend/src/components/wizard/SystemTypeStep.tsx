'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { systemTypeSchema, SystemTypeFormData } from '@/lib/schemas';
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

const SYSTEM_TYPE_OPTIONS = [
  { value: 'split', label: 'Split' },
  { value: 'package', label: 'Package' },
  { value: 'i-dont-know', label: "I don't know" },
] as const;

export function SystemTypeStep() {
  const { sessionData, submitStepAndGetNext, goToPrevStep } = useWizardApi();

  const form = useForm<SystemTypeFormData>({
    resolver: zodResolver(systemTypeSchema),
    defaultValues: sessionData?.data.systemType
      ? {
          type: sessionData.data.systemType
            .systemType as SystemTypeFormData['type'],
        }
      : {
          type: undefined,
        },
  });

  const onSubmit = async (data: SystemTypeFormData) => {
    try {
      const systemTypeData = {
        systemType: data.type,
        customType: data.type === 'i-dont-know' ? undefined : data.type,
      };
      await submitStepAndGetNext(systemTypeData);
    } catch (error) {
      console.error('Failed to submit system type:', error);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>System Type</CardTitle>
        <CardDescription>
          What type of HVAC system do you currently have?
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
                  <FormLabel>System Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className='grid grid-cols-1 gap-3'
                    >
                      {SYSTEM_TYPE_OPTIONS.map((option) => (
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
