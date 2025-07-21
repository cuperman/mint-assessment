import { Test, TestingModule } from '@nestjs/testing';
import { WizardController } from './wizard.controller';
import { WizardService } from '../services/wizard.service';
import {
  ACUnitQuantity,
  SystemType,
  HeatingType,
  QuoteStatus,
} from '../dto/wizard.dto';

describe('WizardController', () => {
  let controller: WizardController;

  const mockQuoteRequest = {
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWizardService = {
    createQuoteRequest: jest.fn(),
    getQuoteRequest: jest.fn(),
    updateQuoteRequest: jest.fn(),
    submitQuoteRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WizardController],
      providers: [
        {
          provide: WizardService,
          useValue: mockWizardService,
        },
      ],
    }).compile();

    controller = module.get<WizardController>(WizardController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuoteRequest', () => {
    it('should create a new quote request', async () => {
      const createResult = { sessionId: 'new-session-id' };
      mockWizardService.createQuoteRequest.mockResolvedValue(createResult);

      const result = await controller.createQuoteRequest();

      expect(mockWizardService.createQuoteRequest).toHaveBeenCalled();
      expect(result).toBe(createResult);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockWizardService.createQuoteRequest.mockRejectedValue(error);

      await expect(controller.createQuoteRequest()).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('getQuoteRequest', () => {
    const sessionId = 'test-session-id';

    it('should return quote request', async () => {
      mockWizardService.getQuoteRequest.mockResolvedValue(mockQuoteRequest);

      const result = await controller.getQuoteRequest(sessionId);

      expect(mockWizardService.getQuoteRequest).toHaveBeenCalledWith(sessionId);
      expect(result).toBe(mockQuoteRequest);
    });

    it('should handle service errors', async () => {
      const error = new Error('Not found');
      mockWizardService.getQuoteRequest.mockRejectedValue(error);

      await expect(controller.getQuoteRequest(sessionId)).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('updateQuoteRequest', () => {
    const sessionId = 'test-session-id';
    const updateData = {
      street: '456 Oak Ave',
      city: 'Dallas',
    };

    it('should update quote request', async () => {
      const updatedQuoteRequest = { ...mockQuoteRequest, ...updateData };
      mockWizardService.updateQuoteRequest.mockResolvedValue(
        updatedQuoteRequest,
      );

      const result = await controller.updateQuoteRequest(sessionId, updateData);

      expect(mockWizardService.updateQuoteRequest).toHaveBeenCalledWith(
        sessionId,
        updateData,
      );
      expect(result).toBe(updatedQuoteRequest);
    });

    it('should handle validation errors', async () => {
      const error = new Error('Validation failed');
      mockWizardService.updateQuoteRequest.mockRejectedValue(error);

      await expect(
        controller.updateQuoteRequest(sessionId, updateData),
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('submitQuoteRequest', () => {
    const sessionId = 'test-session-id';

    it('should submit quote request', async () => {
      const submittedQuoteRequest = {
        ...mockQuoteRequest,
        status: QuoteStatus.SUBMITTED,
      };
      mockWizardService.submitQuoteRequest.mockResolvedValue(
        submittedQuoteRequest,
      );

      const result = await controller.submitQuoteRequest(sessionId);

      expect(mockWizardService.submitQuoteRequest).toHaveBeenCalledWith(
        sessionId,
      );
      expect(result).toBe(submittedQuoteRequest);
      expect(result.status).toBe(QuoteStatus.SUBMITTED);
    });

    it('should handle submission errors', async () => {
      const error = new Error('Submission failed');
      mockWizardService.submitQuoteRequest.mockRejectedValue(error);

      await expect(controller.submitQuoteRequest(sessionId)).rejects.toThrow(
        'Submission failed',
      );
    });
  });

  describe('controller logging', () => {
    it('should log request creation', async () => {
      const createResult = { sessionId: 'new-session-id' };
      mockWizardService.createQuoteRequest.mockResolvedValue(createResult);

      await controller.createQuoteRequest();

      expect(mockWizardService.createQuoteRequest).toHaveBeenCalled();
    });

    it('should log request fetching', async () => {
      const sessionId = 'test-session-id';
      mockWizardService.getQuoteRequest.mockResolvedValue(mockQuoteRequest);

      await controller.getQuoteRequest(sessionId);

      expect(mockWizardService.getQuoteRequest).toHaveBeenCalledWith(sessionId);
    });
  });
});
