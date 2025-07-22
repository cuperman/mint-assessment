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
    const contactData = {
      contactName: 'John Doe',
      contactNumber: '5551234567',
      emailAddress: 'john@example.com',
    };

    it('should submit complete quote request with contact data', async () => {
      const completeQuoteRequest = {
        ...mockQuoteRequest,
        status: QuoteStatus.CONTACT_INFO,
        save: jest.fn().mockResolvedValue(true),
      };
      mockModel.findOne.mockResolvedValue(completeQuoteRequest);

      const result = await service.submitQuoteRequest(sessionId, contactData);

      expect(completeQuoteRequest.contactName).toBe(contactData.contactName);
      expect(completeQuoteRequest.contactNumber).toBe(
        contactData.contactNumber,
      );
      expect(completeQuoteRequest.emailAddress).toBe(contactData.emailAddress);
      expect(result.status).toBe(QuoteStatus.SUBMITTED);
      expect(completeQuoteRequest.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when quote request not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(
        service.submitQuoteRequest(sessionId, contactData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when required fields missing', async () => {
      const incompleteQuoteRequest = {
        sessionId,
        street: '123 Main St',
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn(),
      };
      mockModel.findOne.mockResolvedValue(incompleteQuoteRequest);

      await expect(
        service.submitQuoteRequest(sessionId, contactData),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.submitQuoteRequest(sessionId, contactData),
      ).rejects.toThrow('Quote request is incomplete');
    });

    it('should allow submission with missing AC unit quantity (lenient validation)', async () => {
      const quoteRequestWithoutAC = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        // acUnitQuantity missing
        systemType: SystemType.SPLIT,
        heatingType: HeatingType.GAS,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.findOne.mockResolvedValue(quoteRequestWithoutAC);

      const result = await service.submitQuoteRequest(sessionId, contactData);

      expect(result.contactName).toBe(contactData.contactName);
      expect(result.status).toBe(QuoteStatus.SUBMITTED);
      expect(quoteRequestWithoutAC.save).toHaveBeenCalled();
    });

    it('should allow submission with missing system type (lenient validation)', async () => {
      const quoteRequestWithoutSystem = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        // systemType missing
        heatingType: HeatingType.GAS,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.findOne.mockResolvedValue(quoteRequestWithoutSystem);

      const result = await service.submitQuoteRequest(sessionId, contactData);

      expect(result.contactName).toBe(contactData.contactName);
      expect(result.status).toBe(QuoteStatus.SUBMITTED);
      expect(quoteRequestWithoutSystem.save).toHaveBeenCalled();
    });

    it('should allow submission with missing heating type (lenient validation)', async () => {
      const quoteRequestWithoutHeating = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        // heatingType missing
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.findOne.mockResolvedValue(quoteRequestWithoutHeating);

      const result = await service.submitQuoteRequest(sessionId, contactData);

      expect(result.contactName).toBe(contactData.contactName);
      expect(result.status).toBe(QuoteStatus.SUBMITTED);
      expect(quoteRequestWithoutHeating.save).toHaveBeenCalled();
    });

    it('should allow submission with all system fields missing (smart progression scenario)', async () => {
      const minimalQuoteRequest = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        // All system fields missing (user selected "I don't know" options)
        status: QuoteStatus.CONTACT_INFO,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.findOne.mockResolvedValue(minimalQuoteRequest);

      const result = await service.submitQuoteRequest(sessionId, contactData);

      expect(result.contactName).toBe(contactData.contactName);
      expect(result.status).toBe(QuoteStatus.SUBMITTED);
      expect(minimalQuoteRequest.save).toHaveBeenCalled();
    });
  });

  describe('Smart status progression for "I don\'t know" responses', () => {
    const sessionId = 'test-session-id';

    it('should progress to contact_info when AC unit quantity is "more than 3"', async () => {
      const quoteRequest = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.MORE_THAN_THREE,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.findOne.mockResolvedValue(quoteRequest);

      const result = await service.updateQuoteRequest(sessionId, {
        acUnitQuantity: ACUnitQuantity.MORE_THAN_THREE,
      });

      expect(result.status).toBe(QuoteStatus.CONTACT_INFO);
    });

    it('should progress to contact_info when AC unit quantity is "I don\'t know"', async () => {
      const quoteRequest = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.I_DONT_KNOW,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.findOne.mockResolvedValue(quoteRequest);

      const result = await service.updateQuoteRequest(sessionId, {
        acUnitQuantity: ACUnitQuantity.I_DONT_KNOW,
      });

      expect(result.status).toBe(QuoteStatus.CONTACT_INFO);
    });

    it('should progress to contact_info when system type is "I don\'t know"', async () => {
      const quoteRequest = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.I_DONT_KNOW,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.findOne.mockResolvedValue(quoteRequest);

      const result = await service.updateQuoteRequest(sessionId, {
        systemType: SystemType.I_DONT_KNOW,
      });

      expect(result.status).toBe(QuoteStatus.CONTACT_INFO);
    });

    it('should progress to contact_info when heating type is "I don\'t know"', async () => {
      const quoteRequest = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        heatingType: HeatingType.I_DONT_KNOW,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.findOne.mockResolvedValue(quoteRequest);

      const result = await service.updateQuoteRequest(sessionId, {
        heatingType: HeatingType.I_DONT_KNOW,
      });

      expect(result.status).toBe(QuoteStatus.CONTACT_INFO);
    });

    it('should stay in questionnaire status when all values are known', async () => {
      const quoteRequest = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.findOne.mockResolvedValue(quoteRequest);

      const result = await service.updateQuoteRequest(sessionId, {
        systemType: SystemType.SPLIT,
      });

      expect(result.status).toBe(QuoteStatus.QUESTIONNAIRE);
    });
  });
});
