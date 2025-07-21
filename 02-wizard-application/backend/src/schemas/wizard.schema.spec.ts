import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { QuoteRequest, QuoteRequestSchema } from './wizard.schema';
import {
  ACUnitQuantity,
  SystemType,
  HeatingType,
  QuoteStatus,
} from '../dto/wizard.dto';

describe('QuoteRequest Schema', () => {
  let model: Model<QuoteRequest>;
  let mongoServer: MongoMemoryServer;
  let module: TestingModule;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([
          { name: QuoteRequest.name, schema: QuoteRequestSchema },
        ]),
      ],
    }).compile();

    model = module.get<Model<QuoteRequest>>(getModelToken(QuoteRequest.name));
  });

  afterAll(async () => {
    await module.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await model.deleteMany({});
  });

  describe('Valid Data', () => {
    it('should create a quote request with valid data', async () => {
      const validQuoteRequest = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        heatingType: HeatingType.GAS,
        contactName: 'John Doe',
        contactNumber: '5551234567',
        emailAddress: 'john@example.com',
        status: QuoteStatus.QUESTIONNAIRE,
      };

      const quoteRequest = new model(validQuoteRequest);
      const savedQuoteRequest = await quoteRequest.save();

      expect(savedQuoteRequest._id).toBeDefined();
      expect(savedQuoteRequest.sessionId).toBe(validQuoteRequest.sessionId);
      expect(savedQuoteRequest.street).toBe(validQuoteRequest.street);
      expect(savedQuoteRequest.status).toBe(QuoteStatus.QUESTIONNAIRE);
      expect(savedQuoteRequest.createdAt).toBeDefined();
      expect(savedQuoteRequest.updatedAt).toBeDefined();
    });

    it('should set default status to QUESTIONNAIRE', async () => {
      const quoteRequestData = {
        sessionId: '550e8400-e29b-41d4-a716-446655440001',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.ONE,
        systemType: SystemType.PACKAGE,
        contactName: 'Jane Doe',
        contactNumber: '5551234568',
        emailAddress: 'jane@example.com',
        // No status provided - should default to QUESTIONNAIRE
      };

      const quoteRequest = new model(quoteRequestData);
      const savedQuoteRequest = await quoteRequest.save();

      expect(savedQuoteRequest.status).toBe(QuoteStatus.QUESTIONNAIRE);
    });
  });

  describe('Required Field Validation', () => {
    it('should fail validation when sessionId is missing', async () => {
      const invalidData = {
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        contactName: 'John Doe',
        contactNumber: '5551234567',
        emailAddress: 'john@example.com',
      };

      const quoteRequest = new model(invalidData);

      await expect(quoteRequest.save()).rejects.toThrow(/sessionId.*required/);
    });

    it('should allow creation when only sessionId is provided (progressive updates)', async () => {
      const minimalData = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        // Other fields can be added progressively via updates
      };

      const quoteRequest = new model(minimalData);

      await expect(quoteRequest.save()).resolves.toBeTruthy();
      expect(quoteRequest.sessionId).toBe(
        '550e8400-e29b-41d4-a716-446655440000',
      );
      expect(quoteRequest.status).toBe('questionnaire'); // default status
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique sessionId constraint', async () => {
      const quoteRequestData = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        contactName: 'John Doe',
        contactNumber: '5551234567',
        emailAddress: 'john@example.com',
      };

      // Create first quote request
      const firstQuoteRequest = new model(quoteRequestData);
      await firstQuoteRequest.save();

      // Try to create second with same sessionId
      const duplicateQuoteRequest = new model({
        ...quoteRequestData,
        contactName: 'Jane Doe', // Different data but same sessionId
      });

      await expect(duplicateQuoteRequest.save()).rejects.toThrow(
        /duplicate key/,
      );
    });
  });

  describe('Format Validation', () => {
    it('should reject invalid zip code format', async () => {
      const invalidData = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '7870A', // Invalid - contains letter
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        contactName: 'John Doe',
        contactNumber: '5551234567',
        emailAddress: 'john@example.com',
      };

      const quoteRequest = new model(invalidData);

      await expect(quoteRequest.save()).rejects.toThrow(/zipCode.*invalid/);
    });

    it('should reject invalid contact number format', async () => {
      const invalidData = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        contactName: 'John Doe',
        contactNumber: '555-123-4567', // Invalid - contains dashes
        emailAddress: 'john@example.com',
      };

      const quoteRequest = new model(invalidData);

      await expect(quoteRequest.save()).rejects.toThrow(
        /contactNumber.*invalid/,
      );
    });

    it('should reject invalid state length', async () => {
      const invalidData = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        street: '123 Main St',
        city: 'Austin',
        state: 'TEX', // Invalid - too long
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        contactName: 'John Doe',
        contactNumber: '5551234567',
        emailAddress: 'john@example.com',
      };

      const quoteRequest = new model(invalidData);

      await expect(quoteRequest.save()).rejects.toThrow(/state.*length/);
    });
  });

  describe('Enum Validation', () => {
    it('should accept all valid ACUnitQuantity values', async () => {
      const validValues = Object.values(ACUnitQuantity);

      for (const value of validValues) {
        const quoteRequestData = {
          sessionId: `550e8400-e29b-41d4-a716-${Date.now()}-${Math.random()}`,
          street: '123 Main St',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          acUnitQuantity: value,
          systemType: SystemType.SPLIT,
          heatingType: HeatingType.GAS,
          contactName: 'John Doe',
          contactNumber: '5551234567',
          emailAddress: 'john@example.com',
        };

        const quoteRequest = new model(quoteRequestData);
        const saved = await quoteRequest.save();
        expect(saved.acUnitQuantity).toBe(value);
      }
    });

    it('should reject invalid enum values', async () => {
      const invalidData = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: 'invalid_value' as ACUnitQuantity,
        systemType: SystemType.SPLIT,
        heatingType: HeatingType.GAS,
        contactName: 'John Doe',
        contactNumber: '5551234567',
        emailAddress: 'john@example.com',
      };

      const quoteRequest = new model(invalidData);

      await expect(quoteRequest.save()).rejects.toThrow(/acUnitQuantity.*enum/);
    });

    it('should accept all valid SystemType values', async () => {
      const validValues = Object.values(SystemType);

      for (const value of validValues) {
        const quoteRequestData = {
          sessionId: `550e8400-e29b-41d4-a716-${Date.now()}-${Math.random()}`,
          street: '123 Main St',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          acUnitQuantity: ACUnitQuantity.TWO,
          systemType: value,
          heatingType: HeatingType.GAS,
          contactName: 'John Doe',
          contactNumber: '5551234567',
          emailAddress: 'john@example.com',
        };

        const quoteRequest = new model(quoteRequestData);
        const saved = await quoteRequest.save();
        expect(saved.systemType).toBe(value);
      }
    });

    it('should accept all valid HeatingType values', async () => {
      const validValues = Object.values(HeatingType);

      for (const value of validValues) {
        const quoteRequestData = {
          sessionId: `550e8400-e29b-41d4-a716-${Date.now()}-${Math.random()}`,
          street: '123 Main St',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          acUnitQuantity: ACUnitQuantity.TWO,
          systemType: SystemType.SPLIT,
          heatingType: value,
          contactName: 'John Doe',
          contactNumber: '5551234567',
          emailAddress: 'john@example.com',
        };

        const quoteRequest = new model(quoteRequestData);
        const saved = await quoteRequest.save();
        expect(saved.heatingType).toBe(value);
      }
    });

    it('should reject invalid HeatingType values', async () => {
      const invalidData = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        heatingType: 'wood_burning' as HeatingType,
        contactName: 'John Doe',
        contactNumber: '5551234567',
        emailAddress: 'john@example.com',
      };

      const quoteRequest = new model(invalidData);

      await expect(quoteRequest.save()).rejects.toThrow(/heatingType.*enum/);
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const quoteRequestData = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        heatingType: HeatingType.GAS,
        contactName: 'John Doe',
        contactNumber: '5551234567',
        emailAddress: 'john@example.com',
      };

      const quoteRequest = new model(quoteRequestData);
      const savedQuoteRequest = await quoteRequest.save();

      expect(savedQuoteRequest.createdAt).toBeDefined();
      expect(savedQuoteRequest.updatedAt).toBeDefined();
      expect(savedQuoteRequest.createdAt).toBeInstanceOf(Date);
      expect(savedQuoteRequest.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when document is modified', async () => {
      const quoteRequestData = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        contactName: 'John Doe',
        contactNumber: '5551234567',
        emailAddress: 'john@example.com',
      };

      const quoteRequest = new model(quoteRequestData);
      const savedQuoteRequest = await quoteRequest.save();
      const originalUpdatedAt = savedQuoteRequest.updatedAt;

      // Wait a moment to ensure time difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Update the document
      savedQuoteRequest.status = QuoteStatus.CONTACT_INFO;
      const updatedQuoteRequest = await savedQuoteRequest.save();

      expect(updatedQuoteRequest.updatedAt?.getTime()).toBeGreaterThan(
        originalUpdatedAt?.getTime() || 0,
      );
    });
  });
});
