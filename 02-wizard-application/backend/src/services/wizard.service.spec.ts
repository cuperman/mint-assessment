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
  updateOne: jest.Mock;
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
  toObject: jest.Mock;
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
    toObject: jest.fn(),
  };

  beforeEach(async () => {
    mockModel = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
      mockImplementation: jest.fn(),
    } as MockModel;

    // Configure toObject to return a simple object copy without function references
    mockQuoteRequest.toObject.mockReturnValue({
      sessionId: mockQuoteRequest.sessionId,
      street: mockQuoteRequest.street,
      city: mockQuoteRequest.city,
      state: mockQuoteRequest.state,
      zipCode: mockQuoteRequest.zipCode,
      acUnitQuantity: mockQuoteRequest.acUnitQuantity,
      systemType: mockQuoteRequest.systemType,
      heatingType: mockQuoteRequest.heatingType,
      contactName: mockQuoteRequest.contactName,
      contactNumber: mockQuoteRequest.contactNumber,
      emailAddress: mockQuoteRequest.emailAddress,
      status: mockQuoteRequest.status,
    });

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

      expect(result).toHaveProperty('sessionId', mockQuoteRequest.sessionId);
      expect(result).toHaveProperty('isQuestionnaireComplete');
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
        toObject: jest.fn(),
      };

      // Configure toObject to return the object data
      const objectData = {
        sessionId: updatedQuoteRequest.sessionId,
        street: updatedQuoteRequest.street,
        city: updatedQuoteRequest.city,
        state: updatedQuoteRequest.state,
        zipCode: updatedQuoteRequest.zipCode,
        acUnitQuantity: updatedQuoteRequest.acUnitQuantity,
        systemType: updatedQuoteRequest.systemType,
        heatingType: updatedQuoteRequest.heatingType,
        contactName: updatedQuoteRequest.contactName,
        contactNumber: updatedQuoteRequest.contactNumber,
        emailAddress: updatedQuoteRequest.emailAddress,
        status: updatedQuoteRequest.status,
      };
      updatedQuoteRequest.toObject.mockReturnValue(objectData);

      // First findOne call to check if quote exists
      mockModel.findOne.mockResolvedValueOnce(mockQuoteRequest);
      // Mock updateOne to succeed
      mockModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      // Second findOne call to get updated document
      mockModel.findOne.mockResolvedValueOnce(updatedQuoteRequest);

      const result = await service.updateQuoteRequest(sessionId, updateData);

      expect(result).toHaveProperty('sessionId', updatedQuoteRequest.sessionId);
      expect(result).toHaveProperty('street', updateData.street);
      expect(result).toHaveProperty('city', updateData.city);
      expect(result).toHaveProperty('isQuestionnaireComplete');
      expect(mockModel.findOne).toHaveBeenCalledTimes(2);
      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { sessionId },
        { $set: updateData },
      );
    });

    it('should throw NotFoundException when quote request not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateQuoteRequest(sessionId, updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should progress status when address and system info complete', async () => {
      const initialData = {
        ...mockQuoteRequest,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn(),
      };

      const completeSystemData = {
        ...initialData,
        status: QuoteStatus.CONTACT_INFO, // Status should progress
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn(),
      };

      // Configure toObject to return the object data
      const objectData = {
        sessionId: completeSystemData.sessionId,
        street: completeSystemData.street,
        city: completeSystemData.city,
        state: completeSystemData.state,
        zipCode: completeSystemData.zipCode,
        acUnitQuantity: completeSystemData.acUnitQuantity,
        systemType: completeSystemData.systemType,
        heatingType: completeSystemData.heatingType,
        contactName: completeSystemData.contactName,
        contactNumber: completeSystemData.contactNumber,
        emailAddress: completeSystemData.emailAddress,
        status: completeSystemData.status,
      };
      completeSystemData.toObject.mockReturnValue(objectData);

      // First findOne call to check if quote exists
      mockModel.findOne.mockResolvedValueOnce(initialData);
      // Mock updateOne to succeed
      mockModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      // Second findOne call to get updated document
      mockModel.findOne.mockResolvedValueOnce(completeSystemData);

      const result = await service.updateQuoteRequest(sessionId, {
        acUnitQuantity: ACUnitQuantity.TWO,
      });

      expect(result.status).toBe(QuoteStatus.CONTACT_INFO);
      expect(result).toHaveProperty('isQuestionnaireComplete');
      expect(mockModel.updateOne).toHaveBeenCalled();
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
        toObject: jest.fn(),
      };

      // Configure toObject to return the current state including contact data
      completeQuoteRequest.toObject.mockImplementation(() => {
        return {
          sessionId: completeQuoteRequest.sessionId,
          street: completeQuoteRequest.street,
          city: completeQuoteRequest.city,
          state: completeQuoteRequest.state,
          zipCode: completeQuoteRequest.zipCode,
          acUnitQuantity: completeQuoteRequest.acUnitQuantity,
          systemType: completeQuoteRequest.systemType,
          heatingType: completeQuoteRequest.heatingType,
          contactName: completeQuoteRequest.contactName,
          contactNumber: completeQuoteRequest.contactNumber,
          emailAddress: completeQuoteRequest.emailAddress,
          status: completeQuoteRequest.status,
        };
      });

      mockModel.findOne.mockResolvedValue(completeQuoteRequest);

      const result = await service.submitQuoteRequest(sessionId, contactData);

      expect(completeQuoteRequest.contactName).toBe(contactData.contactName);
      expect(completeQuoteRequest.contactNumber).toBe(
        contactData.contactNumber,
      );
      expect(completeQuoteRequest.emailAddress).toBe(contactData.emailAddress);
      expect(result.status).toBe(QuoteStatus.SUBMITTED);
      expect(result).toHaveProperty('isQuestionnaireComplete');
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
        contactName: undefined, // Will be set by service
        contactNumber: undefined, // Will be set by service
        emailAddress: undefined, // Will be set by service
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn().mockReturnValue({
          sessionId,
          street: '123 Main St',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          systemType: SystemType.SPLIT,
          heatingType: HeatingType.GAS,
          status: QuoteStatus.SUBMITTED,
          contactName: contactData.contactName,
          contactNumber: contactData.contactNumber,
          emailAddress: contactData.emailAddress,
        }),
      };

      mockModel.findOne.mockResolvedValue(quoteRequestWithoutAC);

      const result = await service.submitQuoteRequest(sessionId, contactData);

      expect(result.contactName).toBe(contactData.contactName);
      expect(result.status).toBe(QuoteStatus.SUBMITTED);
      expect(result).toHaveProperty('isQuestionnaireComplete');
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
        toObject: jest.fn(),
      };

      // Configure toObject to return current state including any updates
      quoteRequestWithoutSystem.toObject.mockImplementation(() => ({
        sessionId: quoteRequestWithoutSystem.sessionId,
        street: quoteRequestWithoutSystem.street,
        city: quoteRequestWithoutSystem.city,
        state: quoteRequestWithoutSystem.state,
        zipCode: quoteRequestWithoutSystem.zipCode,
        acUnitQuantity: quoteRequestWithoutSystem.acUnitQuantity,
        heatingType: quoteRequestWithoutSystem.heatingType,
        contactName: contactData.contactName, // Use the contact data from the test
        contactNumber: contactData.contactNumber,
        emailAddress: contactData.emailAddress,
        status: QuoteStatus.SUBMITTED, // Status will be updated by service
      }));

      mockModel.findOne.mockResolvedValue(quoteRequestWithoutSystem);

      const result = await service.submitQuoteRequest(sessionId, contactData);

      expect(result.contactName).toBe(contactData.contactName);
      expect(result.status).toBe(QuoteStatus.SUBMITTED);
      expect(result).toHaveProperty('isQuestionnaireComplete');
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
        toObject: jest.fn(),
      };

      // Configure toObject to return current state including any updates
      quoteRequestWithoutHeating.toObject.mockImplementation(() => ({
        sessionId: quoteRequestWithoutHeating.sessionId,
        street: quoteRequestWithoutHeating.street,
        city: quoteRequestWithoutHeating.city,
        state: quoteRequestWithoutHeating.state,
        zipCode: quoteRequestWithoutHeating.zipCode,
        acUnitQuantity: quoteRequestWithoutHeating.acUnitQuantity,
        systemType: quoteRequestWithoutHeating.systemType,
        contactName: contactData.contactName, // Use the contact data from the test
        contactNumber: contactData.contactNumber,
        emailAddress: contactData.emailAddress,
        status: QuoteStatus.SUBMITTED, // Status will be updated by service
      }));

      mockModel.findOne.mockResolvedValue(quoteRequestWithoutHeating);

      const result = await service.submitQuoteRequest(sessionId, contactData);

      expect(result.contactName).toBe(contactData.contactName);
      expect(result.status).toBe(QuoteStatus.SUBMITTED);
      expect(result).toHaveProperty('isQuestionnaireComplete');
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
        toObject: jest.fn(),
      };

      // Configure toObject to return current state including any updates
      minimalQuoteRequest.toObject.mockImplementation(() => ({
        sessionId: minimalQuoteRequest.sessionId,
        street: minimalQuoteRequest.street,
        city: minimalQuoteRequest.city,
        zipCode: minimalQuoteRequest.zipCode,
        contactName: contactData.contactName, // Use the contact data from the test
        contactNumber: contactData.contactNumber,
        emailAddress: contactData.emailAddress,
        status: QuoteStatus.SUBMITTED, // Status will be updated by service
      }));

      mockModel.findOne.mockResolvedValue(minimalQuoteRequest);

      const result = await service.submitQuoteRequest(sessionId, contactData);

      expect(result.contactName).toBe(contactData.contactName);
      expect(result.status).toBe(QuoteStatus.SUBMITTED);
      expect(result).toHaveProperty('isQuestionnaireComplete');
      expect(minimalQuoteRequest.save).toHaveBeenCalled();
    });
  });

  describe('Smart status progression for "I don\'t know" responses', () => {
    const sessionId = 'test-session-id';

    it('should progress to contact_info when AC unit quantity is "more than 3"', async () => {
      const initialQuoteRequest = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(),
      };

      const updatedQuoteRequest = {
        ...initialQuoteRequest,
        acUnitQuantity: ACUnitQuantity.MORE_THAN_THREE,
        status: QuoteStatus.CONTACT_INFO,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(),
      };

      // Configure toObject to return the updated state
      updatedQuoteRequest.toObject.mockImplementation(() => ({
        sessionId: updatedQuoteRequest.sessionId,
        street: updatedQuoteRequest.street,
        city: updatedQuoteRequest.city,
        state: updatedQuoteRequest.state,
        zipCode: updatedQuoteRequest.zipCode,
        acUnitQuantity: updatedQuoteRequest.acUnitQuantity,
        status: updatedQuoteRequest.status,
      }));

      // First findOne call to check if quote exists
      mockModel.findOne.mockResolvedValueOnce(initialQuoteRequest);
      // Mock updateOne to succeed
      mockModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      // Second findOne call to get updated document
      mockModel.findOne.mockResolvedValueOnce(updatedQuoteRequest);

      const result = await service.updateQuoteRequest(sessionId, {
        acUnitQuantity: ACUnitQuantity.MORE_THAN_THREE,
      });

      expect(result.status).toBe(QuoteStatus.CONTACT_INFO);
      expect(result).toHaveProperty('isQuestionnaireComplete');
    });

    it('should progress to contact_info when AC unit quantity is "I don\'t know"', async () => {
      const initialQuoteRequest = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(),
      };

      const updatedQuoteRequest = {
        ...initialQuoteRequest,
        acUnitQuantity: ACUnitQuantity.I_DONT_KNOW,
        status: QuoteStatus.CONTACT_INFO,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(),
      };

      // Configure toObject to return the updated state
      updatedQuoteRequest.toObject.mockImplementation(() => ({
        sessionId: updatedQuoteRequest.sessionId,
        street: updatedQuoteRequest.street,
        city: updatedQuoteRequest.city,
        state: updatedQuoteRequest.state,
        zipCode: updatedQuoteRequest.zipCode,
        acUnitQuantity: updatedQuoteRequest.acUnitQuantity,
        status: updatedQuoteRequest.status,
      }));

      // First findOne call to check if quote exists
      mockModel.findOne.mockResolvedValueOnce(initialQuoteRequest);
      // Mock updateOne to succeed
      mockModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      // Second findOne call to get updated document
      mockModel.findOne.mockResolvedValueOnce(updatedQuoteRequest);

      const result = await service.updateQuoteRequest(sessionId, {
        acUnitQuantity: ACUnitQuantity.I_DONT_KNOW,
      });

      expect(result.status).toBe(QuoteStatus.CONTACT_INFO);
      expect(result).toHaveProperty('isQuestionnaireComplete');
    });

    it('should progress to contact_info when system type is "I don\'t know"', async () => {
      const initialQuoteRequest = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(),
      };

      const updatedQuoteRequest = {
        ...initialQuoteRequest,
        systemType: SystemType.I_DONT_KNOW,
        status: QuoteStatus.CONTACT_INFO,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(),
      };

      // Configure toObject to return the updated state
      updatedQuoteRequest.toObject.mockImplementation(() => ({
        sessionId: updatedQuoteRequest.sessionId,
        street: updatedQuoteRequest.street,
        city: updatedQuoteRequest.city,
        state: updatedQuoteRequest.state,
        zipCode: updatedQuoteRequest.zipCode,
        acUnitQuantity: updatedQuoteRequest.acUnitQuantity,
        systemType: updatedQuoteRequest.systemType,
        status: updatedQuoteRequest.status,
      }));

      // First findOne call to check if quote exists
      mockModel.findOne.mockResolvedValueOnce(initialQuoteRequest);
      // Mock updateOne to succeed
      mockModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      // Second findOne call to get updated document
      mockModel.findOne.mockResolvedValueOnce(updatedQuoteRequest);

      const result = await service.updateQuoteRequest(sessionId, {
        systemType: SystemType.I_DONT_KNOW,
      });

      expect(result.status).toBe(QuoteStatus.CONTACT_INFO);
      expect(result).toHaveProperty('isQuestionnaireComplete');
    });

    it('should progress to contact_info when heating type is "I don\'t know"', async () => {
      const initialQuoteRequest = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        systemType: SystemType.SPLIT,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(),
      };

      const updatedQuoteRequest = {
        ...initialQuoteRequest,
        heatingType: HeatingType.I_DONT_KNOW,
        status: QuoteStatus.CONTACT_INFO,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(),
      };

      // Configure toObject to return the updated state
      updatedQuoteRequest.toObject.mockImplementation(() => ({
        sessionId: updatedQuoteRequest.sessionId,
        street: updatedQuoteRequest.street,
        city: updatedQuoteRequest.city,
        state: updatedQuoteRequest.state,
        zipCode: updatedQuoteRequest.zipCode,
        acUnitQuantity: updatedQuoteRequest.acUnitQuantity,
        systemType: updatedQuoteRequest.systemType,
        heatingType: updatedQuoteRequest.heatingType,
        status: updatedQuoteRequest.status,
      }));

      // First findOne call to check if quote exists
      mockModel.findOne.mockResolvedValueOnce(initialQuoteRequest);
      // Mock updateOne to succeed
      mockModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      // Second findOne call to get updated document
      mockModel.findOne.mockResolvedValueOnce(updatedQuoteRequest);

      const result = await service.updateQuoteRequest(sessionId, {
        heatingType: HeatingType.I_DONT_KNOW,
      });

      expect(result.status).toBe(QuoteStatus.CONTACT_INFO);
      expect(result).toHaveProperty('isQuestionnaireComplete');
    });

    it('should stay in questionnaire status when all values are known', async () => {
      const initialQuoteRequest = {
        sessionId,
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        acUnitQuantity: ACUnitQuantity.TWO,
        status: QuoteStatus.QUESTIONNAIRE,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(),
      };

      const updatedQuoteRequest = {
        ...initialQuoteRequest,
        systemType: SystemType.SPLIT,
        status: QuoteStatus.QUESTIONNAIRE, // Should stay in questionnaire
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(),
      };

      // Configure toObject to return the object data
      updatedQuoteRequest.toObject.mockImplementation(() => ({
        sessionId: updatedQuoteRequest.sessionId,
        street: updatedQuoteRequest.street,
        city: updatedQuoteRequest.city,
        state: updatedQuoteRequest.state,
        zipCode: updatedQuoteRequest.zipCode,
        acUnitQuantity: updatedQuoteRequest.acUnitQuantity,
        systemType: updatedQuoteRequest.systemType,
        status: updatedQuoteRequest.status,
      }));

      // First findOne call to check if quote exists
      mockModel.findOne.mockResolvedValueOnce(initialQuoteRequest);
      // Mock updateOne to succeed
      mockModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      // Second findOne call to get updated document
      mockModel.findOne.mockResolvedValueOnce(updatedQuoteRequest);

      const result = await service.updateQuoteRequest(sessionId, {
        systemType: SystemType.SPLIT,
      });

      expect(result.status).toBe(QuoteStatus.QUESTIONNAIRE);
      expect(result).toHaveProperty('isQuestionnaireComplete');
    });
  });
});
