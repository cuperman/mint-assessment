import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
});

export const acUnitsSchema = z.object({
  units: z.enum(['1', '2', 'more-than-3', 'i_dont_know'], {
    message: 'Please select the number of AC units',
  }),
});

export const systemTypeSchema = z.object({
  type: z.enum(['split', 'package', 'i_dont_know'], {
    message: 'Please select the system type',
  }),
});

export const heatingTypeSchema = z.object({
  type: z.enum(['heat-pump', 'gas', 'i_dont_know'], {
    message: 'Please select the heating type',
  }),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z
    .string()
    .regex(/^\(?(\d{3})\)?[-. ]?(\d{3})[-. ]?(\d{4})$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address'),
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type ACUnitsFormData = z.infer<typeof acUnitsSchema>;
export type SystemTypeFormData = z.infer<typeof systemTypeSchema>;
export type HeatingTypeFormData = z.infer<typeof heatingTypeSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
