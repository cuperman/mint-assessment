import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

// Format phone number as user types: (555) 123-4567
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Apply formatting based on length
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10,
    )}`;
  }
};

// Get raw digits from formatted phone number
export const getPhoneDigits = (formattedValue: string): string => {
  return formattedValue.replace(/\D/g, '');
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = '', onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      formatPhoneNumber(value),
    );

    // Update display value when prop value changes (e.g., from form reset)
    React.useEffect(() => {
      setDisplayValue(formatPhoneNumber(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const digits = inputValue.replace(/\D/g, '');

      // Limit to 10 digits
      if (digits.length <= 10) {
        const formatted = formatPhoneNumber(digits);
        setDisplayValue(formatted);

        // Call onChange with raw digits for form handling
        if (onChange) {
          onChange(digits);
        }
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type='tel'
        className={cn(className)}
        value={displayValue}
        onChange={handleChange}
        placeholder='(555) 123-4567'
      />
    );
  },
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
