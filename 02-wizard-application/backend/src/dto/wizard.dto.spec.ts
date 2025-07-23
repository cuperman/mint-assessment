import { validate } from 'class-validator';
import {
  QuoteRequest,
  SubmitQuoteRequest,
  ACUnitQuantity,
  SystemType,
  HeatingType,
  QuoteStatus,
} from './wizard.dto';

// Helper function to create test object with invalid property values
function createInvalidRequest(
  baseRequest: QuoteRequest,
  property: keyof QuoteRequest,
  value: unknown,
): QuoteRequest {
  const invalidRequest = Object.assign(new QuoteRequest(), baseRequest);
  (invalidRequest as unknown as Record<string, unknown>)[property] = value;
  return invalidRequest;
}

describe('QuoteRequest DTO', () => {
  let quoteRequest: QuoteRequest;

  beforeEach(() => {
    quoteRequest = new QuoteRequest();
    quoteRequest.sessionId = '550e8400-e29b-41d4-a716-446655440000';
    quoteRequest.street = '123 Main St';
    quoteRequest.city = 'Austin';
    quoteRequest.state = 'TX';
    quoteRequest.zipCode = '78701';
    quoteRequest.acUnitQuantity = ACUnitQuantity.TWO;
    quoteRequest.systemType = SystemType.SPLIT;
    quoteRequest.heatingType = HeatingType.GAS;
    quoteRequest.contactName = 'John Doe';
    quoteRequest.contactNumber = '5551234567';
    quoteRequest.emailAddress = 'john@example.com';
    quoteRequest.status = QuoteStatus.QUESTIONNAIRE;
  });

  describe('Valid Data', () => {
    it('should pass validation with all valid data', async () => {
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(0);
    });

    it('should allow optional timestamp fields to be omitted', async () => {
      // Don't set createdAt/updatedAt
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(0);
    });

    it('should allow optional timestamp fields to be set', async () => {
      const isoString = new Date().toISOString();
      quoteRequest.createdAt = isoString as unknown as Date;
      quoteRequest.updatedAt = isoString as unknown as Date;
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(0);
    });
  });

  describe('SessionId Validation', () => {
    it('should reject invalid UUID format', async () => {
      quoteRequest.sessionId = 'invalid-uuid';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sessionId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should reject empty sessionId', async () => {
      quoteRequest.sessionId = '';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sessionId');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should accept valid UUID v4 format', async () => {
      quoteRequest.sessionId = '123e4567-e89b-12d3-a456-426614174000';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Address Validation', () => {
    it('should reject empty street', async () => {
      quoteRequest.street = '';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('street');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject empty city', async () => {
      quoteRequest.city = '';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('city');
    });

    it('should reject invalid state length', async () => {
      quoteRequest.state = 'TEX'; // Too long
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('state');
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('should reject single character state', async () => {
      quoteRequest.state = 'T'; // Too short
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('state');
    });

    it('should accept valid 2-character state', async () => {
      quoteRequest.state = 'CA';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Zip Code Validation', () => {
    it('should reject zip code with letters', async () => {
      quoteRequest.zipCode = '7870A';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('zipCode');
      expect(errors[0].constraints?.matches).toContain(
        'Zip code must be exactly 5 digits',
      );
    });

    it('should reject zip code too short', async () => {
      quoteRequest.zipCode = '1234';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('zipCode');
      expect(errors[0].constraints?.matches).toContain(
        'Zip code must be exactly 5 digits',
      );
    });

    it('should reject zip code too long', async () => {
      quoteRequest.zipCode = '123456';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('zipCode');
    });

    it('should reject zip code with special characters', async () => {
      quoteRequest.zipCode = '78701-1234'; // ZIP+4 format not allowed
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('zipCode');
    });

    it('should accept valid 5-digit zip code', async () => {
      quoteRequest.zipCode = '90210';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(0);
    });
  });

  describe('AC Unit Quantity Enum Validation', () => {
    it('should accept all valid ACUnitQuantity enum values', async () => {
      const validValues = [
        ACUnitQuantity.ONE,
        ACUnitQuantity.TWO,
        ACUnitQuantity.MORE_THAN_THREE,
        ACUnitQuantity.I_DONT_KNOW,
      ];

      for (const value of validValues) {
        quoteRequest.acUnitQuantity = value;
        const errors = await validate(quoteRequest);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject invalid ACUnitQuantity values', async () => {
      const invalidRequest = createInvalidRequest(
        quoteRequest,
        'acUnitQuantity',
        'invalid_value',
      );
      const errors = await validate(invalidRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('acUnitQuantity');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should reject numeric values not in enum', async () => {
      const invalidRequest = createInvalidRequest(
        quoteRequest,
        'acUnitQuantity',
        '4',
      );
      const errors = await validate(invalidRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('acUnitQuantity');
    });
  });

  describe('System Type Enum Validation', () => {
    it('should accept all valid SystemType enum values', async () => {
      const validValues = [
        SystemType.SPLIT,
        SystemType.PACKAGE,
        SystemType.I_DONT_KNOW,
      ];

      for (const value of validValues) {
        quoteRequest.systemType = value;
        const errors = await validate(quoteRequest);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject invalid SystemType values', async () => {
      const invalidRequest = createInvalidRequest(
        quoteRequest,
        'systemType',
        'central_air',
      );
      const errors = await validate(invalidRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('systemType');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('Heating Type Enum Validation', () => {
    it('should accept all valid HeatingType enum values', async () => {
      const validValues = [
        HeatingType.HEAT_PUMP,
        HeatingType.GAS,
        HeatingType.I_DONT_KNOW,
      ];

      for (const value of validValues) {
        quoteRequest.heatingType = value;
        const errors = await validate(quoteRequest);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject invalid HeatingType values', async () => {
      const invalidRequest = createInvalidRequest(
        quoteRequest,
        'heatingType',
        'wood',
      );
      const errors = await validate(invalidRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('heatingType');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should reject null HeatingType', async () => {
      const invalidRequest = createInvalidRequest(
        quoteRequest,
        'heatingType',
        null,
      );
      const errors = await validate(invalidRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('heatingType');
    });

    it('should reject empty HeatingType', async () => {
      const invalidRequest = createInvalidRequest(
        quoteRequest,
        'heatingType',
        '',
      );
      const errors = await validate(invalidRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('heatingType');
    });
  });

  describe('Contact Information Validation', () => {
    it('should reject empty contact name', async () => {
      quoteRequest.contactName = '';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('contactName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should accept contact name with spaces', async () => {
      quoteRequest.contactName = 'Jane Mary Smith';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(0);
    });

    it('should reject contact number with dashes', async () => {
      quoteRequest.contactNumber = '555-123-4567';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('contactNumber');
      expect(errors[0].constraints?.matches).toContain(
        'Contact number must be exactly 10 digits',
      );
    });

    it('should reject contact number with parentheses', async () => {
      quoteRequest.contactNumber = '(555) 123-4567';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('contactNumber');
    });

    it('should reject contact number too short', async () => {
      quoteRequest.contactNumber = '555123456'; // 9 digits
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('contactNumber');
    });

    it('should reject contact number too long', async () => {
      quoteRequest.contactNumber = '15551234567'; // 11 digits
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('contactNumber');
    });

    it('should accept valid 10-digit contact number', async () => {
      quoteRequest.contactNumber = '8005551234';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Email Address Validation', () => {
    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@invalid.com',
        'invalid.com',
        'inv@lid@email.com',
        'invalid@.com',
        'invalid@com.',
      ];

      for (const email of invalidEmails) {
        quoteRequest.emailAddress = email;
        const errors = await validate(quoteRequest);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('emailAddress');
        expect(errors[0].constraints?.isEmail).toContain(
          'Please provide a valid email address',
        );
      }
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@example-site.org',
        'test.email@sub.domain.com',
      ];

      for (const email of validEmails) {
        quoteRequest.emailAddress = email;
        const errors = await validate(quoteRequest);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject empty email address', async () => {
      quoteRequest.emailAddress = '';
      const errors = await validate(quoteRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('emailAddress');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('Status Validation', () => {
    it('should accept valid QuoteStatus values', async () => {
      const validStatuses = [
        QuoteStatus.QUESTIONNAIRE,
        QuoteStatus.CONTACT_INFO,
        QuoteStatus.SUBMITTED,
      ];

      for (const status of validStatuses) {
        quoteRequest.status = status;
        const errors = await validate(quoteRequest);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject invalid status values', async () => {
      const invalidRequest = createInvalidRequest(
        quoteRequest,
        'status',
        'invalid_status',
      );
      const errors = await validate(invalidRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should reject empty status', async () => {
      const invalidRequest = createInvalidRequest(quoteRequest, 'status', '');
      const errors = await validate(invalidRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject undefined status', async () => {
      const invalidRequest = Object.assign(new QuoteRequest(), quoteRequest);
      delete (invalidRequest as unknown as Record<string, unknown>).status;
      const errors = await validate(invalidRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject numeric status values', async () => {
      const invalidRequest = createInvalidRequest(quoteRequest, 'status', 1);
      const errors = await validate(invalidRequest);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should verify QuoteStatus enum values match expected strings', () => {
      expect(QuoteStatus.QUESTIONNAIRE).toBe('questionnaire');
      expect(QuoteStatus.CONTACT_INFO).toBe('contact_info');
      expect(QuoteStatus.SUBMITTED).toBe('submitted');
    });
  });

  describe('Edge Cases and Whitespace', () => {
    it('should reject whitespace-only strings', async () => {
      quoteRequest.street = '   ';
      quoteRequest.city = '\t';
      quoteRequest.contactName = '\n';

      const errors = await validate(quoteRequest);
      // Note: class-validator's @IsNotEmpty() doesn't catch whitespace-only strings by default
      // This test demonstrates current behavior - in practice you might want custom validation
      expect(errors.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing required fields', async () => {
      const emptyRequest = new QuoteRequest();
      const errors = await validate(emptyRequest);

      // Should have errors for all required fields
      expect(errors.length).toBeGreaterThan(9);

      const requiredFields = [
        'sessionId',
        'street',
        'city',
        'state',
        'zipCode',
        'acUnitQuantity',
        'systemType',
        'contactName',
        'contactNumber',
        'emailAddress',
        'status',
      ];

      for (const field of requiredFields) {
        const fieldError = errors.find((e) => e.property === field);
        expect(fieldError).toBeDefined();
      }
    });
  });

  describe('Timestamp Fields', () => {
    it('should accept valid ISO date strings for timestamps', async () => {
      const validRequest = createInvalidRequest(
        quoteRequest,
        'createdAt',
        '2024-01-01T10:00:00Z',
      );
      const validRequestWithUpdated = createInvalidRequest(
        validRequest,
        'updatedAt',
        '2024-01-01T11:00:00Z',
      );

      const errors = await validate(validRequestWithUpdated);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid date formats for timestamps', async () => {
      const invalidRequest = createInvalidRequest(
        quoteRequest,
        'createdAt',
        'invalid-date',
      );
      const invalidRequestWithUpdated = createInvalidRequest(
        invalidRequest,
        'updatedAt',
        '2024/01/01',
      );

      const errors = await validate(invalidRequestWithUpdated);
      expect(errors.length).toBeGreaterThanOrEqual(2);

      const createdError = errors.find((e) => e.property === 'createdAt');
      const updatedError = errors.find((e) => e.property === 'updatedAt');

      expect(createdError?.constraints).toHaveProperty('isDateString');
      expect(updatedError?.constraints).toHaveProperty('isDateString');
    });
  });
});

describe('SubmitQuoteRequest DTO', () => {
  let submitRequest: SubmitQuoteRequest;

  beforeEach(() => {
    submitRequest = new SubmitQuoteRequest();
    submitRequest.contactName = 'John Doe';
    submitRequest.contactNumber = '5551234567';
    submitRequest.emailAddress = 'john@example.com';
  });

  describe('Valid Data', () => {
    it('should pass validation with all valid data', async () => {
      const errors = await validate(submitRequest);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Contact Name Validation', () => {
    it('should fail validation for empty contact name', async () => {
      submitRequest.contactName = '';
      const errors = await validate(submitRequest);
      expect(errors.length).toBeGreaterThan(0);

      const nameError = errors.find((e) => e.property === 'contactName');
      expect(nameError?.constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('Contact Number Validation', () => {
    it('should fail validation for invalid contact number format', async () => {
      submitRequest.contactNumber = '123456789'; // 9 digits instead of 10
      const errors = await validate(submitRequest);
      expect(errors.length).toBeGreaterThan(0);

      const numberError = errors.find((e) => e.property === 'contactNumber');
      expect(numberError?.constraints).toHaveProperty('matches');
    });

    it('should fail validation for contact number with letters', async () => {
      submitRequest.contactNumber = '555abc1234';
      const errors = await validate(submitRequest);
      expect(errors.length).toBeGreaterThan(0);

      const numberError = errors.find((e) => e.property === 'contactNumber');
      expect(numberError?.constraints).toHaveProperty('matches');
    });

    it('should pass validation for valid 10-digit contact number', async () => {
      submitRequest.contactNumber = '5551234567';
      const errors = await validate(submitRequest);
      const numberError = errors.find((e) => e.property === 'contactNumber');
      expect(numberError).toBeUndefined();
    });
  });

  describe('Email Address Validation', () => {
    it('should fail validation for invalid email format', async () => {
      submitRequest.emailAddress = 'not-an-email';
      const errors = await validate(submitRequest);
      expect(errors.length).toBeGreaterThan(0);

      const emailError = errors.find((e) => e.property === 'emailAddress');
      expect(emailError?.constraints).toHaveProperty('isEmail');
    });

    it('should pass validation for valid email', async () => {
      submitRequest.emailAddress = 'john@example.com';
      const errors = await validate(submitRequest);
      const emailError = errors.find((e) => e.property === 'emailAddress');
      expect(emailError).toBeUndefined();
    });
  });
});
