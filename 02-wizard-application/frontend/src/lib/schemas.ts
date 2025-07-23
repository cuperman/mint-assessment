import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z
    .string()
    .min(2, 'State is required')
    .max(2, 'State must be 2 characters'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
});

export const acUnitsSchema = z.object({
  units: z.enum(['1', '2', 'more_than_three', 'i_dont_know'], {
    message: 'Please select the number of AC units',
  }),
});

export const systemTypeSchema = z.object({
  type: z.enum(['split', 'package', 'i_dont_know'], {
    message: 'Please select the system type',
  }),
});

export const heatingTypeSchema = z.object({
  type: z.enum(['heat_pump', 'gas', 'i_dont_know'], {
    message: 'Please select the heating type',
  }),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((val) => {
      // Remove all non-digit characters and check if we have exactly 10 digits
      const digits = val.replace(/\D/g, '');
      return digits.length === 10;
    }, 'Phone number must be exactly 10 digits'),
  email: z.string().email('Invalid email address'),
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type ACUnitsFormData = z.infer<typeof acUnitsSchema>;
export type SystemTypeFormData = z.infer<typeof systemTypeSchema>;
export type HeatingTypeFormData = z.infer<typeof heatingTypeSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
