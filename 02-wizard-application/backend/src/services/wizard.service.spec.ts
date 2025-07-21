import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WizardService } from './wizard.service';
import { QuoteRequest } from '../schemas/wizard.schema';
import {
  ACUnitQuantity,
  SystemType,
  HeatingType,
  QuoteStatus,
} from '../dto/wizard.dto';

interface MockModel {
  findOne: jest.Mock;
  // Constructor mock for new QuoteRequest()
  mockImplementation: jest.Mock;
}

interface MockQuoteRequestDocument {
  sessionId: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  acUnitQuantity?: ACUnitQuantity;
  systemType?: SystemType;
  heatingType?: HeatingType;
  contactName?: string;
  contactNumber?: string;
  emailAddress?: string;
  status: QuoteStatus;
  save: jest.Mock;
}

describe('WizardService', () => {
  let service: WizardService;
  let mockModel: MockModel;

  const mockQuoteRequest: MockQuoteRequestDocument = {
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
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockModel = {
      findOne: jest.fn(),
      mockImplementation: jest.fn(),
    } as MockModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WizardService,
        {
          provide: getModelToken(QuoteRequest.name),
          useValue: mockModel as unknown as typeof QuoteRequest,
        },
      ],
    }).compile();

    service = module.get<WizardService>(WizardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuoteRequest', () => {
    it('should return quote request when found', async () => {
      mockModel.findOne.mockResolvedValue(mockQuoteRequest);

      const result = await service.getQuoteRequest('test-session-id');

      expect(result).toBe(mockQuoteRequest);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        sessionId: 'test-session-id',
      });
    });

    it('should throw NotFoundException when quote request not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.getQuoteRequest('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getQuoteRequest('non-existent-id')).rejects.toThrow(
        'Quote request not found: non-existent-id',
      );
    });
  });

  describe('updateQuoteRequest', () => {
    const sessionId = 'test-session-id';
    const updateData = {
      street: '456 Oak Ave',
      city: 'Dallas',
    };

    it('should update quote request and return updated data', async () => {
      const updatedQuoteRequest = {
        ...mockQuoteRequest,
        ...updateData,
        save: jest.fn().mockResolvedValue(true),
      };
      mockModel.findOne.mockResolvedValue(updatedQuoteRequest);

      const result = await service.updateQuoteRequest(sessionId, updateData);

      expect(result).toBe(updatedQuoteRequest);
      expect(mockModel.findOne).toHaveBeenCalledWith({ sessionId });
      expect(updatedQuoteRequest.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when quote request not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateQuoteRequest(sessionId, updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should progress status when address and system info complete', async () => {
      const completeSystemData = {
        ...mockQuoteRequest,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(true),
      };

      mockModel.findOne.mockResolvedValue(completeSystemData);

      await service.updateQuoteRequest(sessionId, {
        acUnitQuantity: ACUnitQuantity.TWO,
      });

      expect(completeSystemData.status).toBe(QuoteStatus.CONTACT_INFO);
      expect(completeSystemData.save).toHaveBeenCalled();
    });
  });

  describe('submitQuoteRequest', () => {
    const sessionId = 'test-session-id';

    it('should submit complete quote request', async () => {
      const completeQuoteRequest = {
        ...mockQuoteRequest,
        status: QuoteStatus.CONTACT_INFO,
        save: jest.fn().mockResolvedValue(true),
      };
      mockModel.findOne.mockResolvedValue(completeQuoteRequest);

      const result = await service.submitQuoteRequest(sessionId);

      expect(result.status).toBe(QuoteStatus.SUBMITTED);
      expect(completeQuoteRequest.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when quote request not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.submitQuoteRequest(sessionId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when required fields missing', async () => {
      const incompleteQuoteRequest = {
        sessionId,
        street: '123 Main St',
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn(),
      };
      mockModel.findOne.mockResolvedValue(incompleteQuoteRequest);

      await expect(service.submitQuoteRequest(sessionId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.submitQuoteRequest(sessionId)).rejects.toThrow(
        'Quote request is incomplete',
      );
    });
  });
});
