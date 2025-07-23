import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuoteRequest } from '../schemas/wizard.schema';
import {
  QuoteRequest as QuoteRequestDto,
  SubmitQuoteRequest,
  QuoteStatus,
  ACUnitQuantity,
  SystemType,
  HeatingType,
} from '../dto/wizard.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WizardService {
  private readonly logger = new Logger(WizardService.name);

  constructor(
    @InjectModel(QuoteRequest.name)
    private quoteRequestModel: Model<QuoteRequest>,
  ) {}

  /**
   * Create a new quote request with empty object and session ID
   * POST /quote_request
   */
  async createQuoteRequest(): Promise<{ sessionId: string }> {
    const sessionId = uuidv4();
    this.logger.log(`Creating new quote request session: ${sessionId}`);

    // Create minimal quote request with only required fields
    const quoteRequestData = {
      sessionId,
      status: QuoteStatus.QUESTIONNAIRE,
    };

    const quoteRequest = new this.quoteRequestModel(quoteRequestData);

    await quoteRequest.save();
    this.logger.log(`Successfully created quote request: ${sessionId}`);

    return { sessionId };
  }

  /**
   * Update quote request with validation
   * PATCH /quote_request/:sessionId
   */
  async updateQuoteRequest(
    sessionId: string,
    updateData: Partial<QuoteRequestDto>,
  ): Promise<QuoteRequestDto> {
    this.logger.log(`Updating quote request ${sessionId}`, {
      sessionId,
      updateFields: Object.keys(updateData),
    });

    const quoteRequest = await this.quoteRequestModel.findOne({ sessionId });
    if (!quoteRequest) {
      throw new NotFoundException(`Quote request not found: ${sessionId}`);
    }

    // Update fields
    Object.assign(quoteRequest, updateData);

    // Auto-progress status based on completeness
    const newStatus = this.determineStatus(quoteRequest);
    if (newStatus !== quoteRequest.status) {
      this.logger.log(
        `Status transition for ${sessionId}: ${quoteRequest.status} -> ${newStatus}`,
      );
      quoteRequest.status = newStatus;
    }

    await quoteRequest.save();

    this.logger.log(`Successfully updated quote request: ${sessionId}`, {
      status: quoteRequest.status,
    });

    const plainObject = quoteRequest.toObject();
    const result: QuoteRequestDto = {
      sessionId: plainObject.sessionId,
      street: plainObject.street,
      city: plainObject.city,
      state: plainObject.state,
      zipCode: plainObject.zipCode,
      acUnitQuantity: plainObject.acUnitQuantity,
      systemType: plainObject.systemType,
      heatingType: plainObject.heatingType,
      contactName: plainObject.contactName,
      contactNumber: plainObject.contactNumber,
      emailAddress: plainObject.emailAddress,
      status: plainObject.status,
      isQuestionnaireComplete: this.isQuestionnaireComplete(quoteRequest),
      createdAt: plainObject.createdAt,
      updatedAt: plainObject.updatedAt,
    };
    return result;
  }

  /**
   * Complete/submit quote request
   * POST /quote_request/:sessionId
   */
  async submitQuoteRequest(
    sessionId: string,
    submitData: SubmitQuoteRequest,
  ): Promise<QuoteRequestDto> {
    this.logger.log(`Submitting quote request: ${sessionId}`);

    const quoteRequest = await this.quoteRequestModel.findOne({ sessionId });
    if (!quoteRequest) {
      throw new NotFoundException(`Quote request not found: ${sessionId}`);
    }

    // Update contact information from submission data
    quoteRequest.contactName = submitData.contactName;
    quoteRequest.contactNumber = submitData.contactNumber;
    quoteRequest.emailAddress = submitData.emailAddress;

    // Validate completeness before submission (now including the new contact data)
    this.validateQuoteRequestComplete(quoteRequest);

    // Mark as submitted
    quoteRequest.status = QuoteStatus.SUBMITTED;
    await quoteRequest.save();

    this.logger.log(`Successfully submitted quote request: ${sessionId}`);
    const plainObject = quoteRequest.toObject();
    const result: QuoteRequestDto = {
      sessionId: plainObject.sessionId,
      street: plainObject.street,
      city: plainObject.city,
      state: plainObject.state,
      zipCode: plainObject.zipCode,
      acUnitQuantity: plainObject.acUnitQuantity,
      systemType: plainObject.systemType,
      heatingType: plainObject.heatingType,
      contactName: plainObject.contactName,
      contactNumber: plainObject.contactNumber,
      emailAddress: plainObject.emailAddress,
      status: plainObject.status,
      isQuestionnaireComplete: this.isQuestionnaireComplete(quoteRequest),
      createdAt: plainObject.createdAt,
      updatedAt: plainObject.updatedAt,
    };
    return result;
  }

  /**
   * Get quote request by session ID
   */
  async getQuoteRequest(sessionId: string): Promise<QuoteRequestDto> {
    const quoteRequest = await this.quoteRequestModel.findOne({ sessionId });
    if (!quoteRequest) {
      throw new NotFoundException(`Quote request not found: ${sessionId}`);
    }

    const plainObject = quoteRequest.toObject();
    const result: QuoteRequestDto = {
      sessionId: plainObject.sessionId,
      street: plainObject.street,
      city: plainObject.city,
      state: plainObject.state,
      zipCode: plainObject.zipCode,
      acUnitQuantity: plainObject.acUnitQuantity,
      systemType: plainObject.systemType,
      heatingType: plainObject.heatingType,
      contactName: plainObject.contactName,
      contactNumber: plainObject.contactNumber,
      emailAddress: plainObject.emailAddress,
      status: plainObject.status,
      isQuestionnaireComplete: this.isQuestionnaireComplete(quoteRequest),
      createdAt: plainObject.createdAt,
      updatedAt: plainObject.updatedAt,
    };
    return result;
  }

  /**
   * Determine status based on data completeness
   */
  private determineStatus(quoteRequest: QuoteRequest): QuoteStatus {
    // Check if questionnaire data is complete
    const hasAddress =
      this.hasValidValue(quoteRequest.street) &&
      this.hasValidValue(quoteRequest.city) &&
      this.hasValidValue(quoteRequest.state) &&
      this.hasValidValue(quoteRequest.zipCode);

    // Check for "I don't know" values that should skip to contact info
    const hasSkipToContactValue =
      quoteRequest.acUnitQuantity === ACUnitQuantity.MORE_THAN_THREE ||
      quoteRequest.acUnitQuantity === ACUnitQuantity.I_DONT_KNOW ||
      quoteRequest.systemType === SystemType.I_DONT_KNOW ||
      quoteRequest.heatingType === HeatingType.I_DONT_KNOW;

    const hasSystemInfo =
      this.hasValidValue(quoteRequest.acUnitQuantity) &&
      this.hasValidValue(quoteRequest.systemType) &&
      this.hasValidValue(quoteRequest.heatingType);

    // Check if contact data is complete
    const hasContact =
      this.hasValidValue(quoteRequest.contactName) &&
      this.hasValidValue(quoteRequest.contactNumber) &&
      this.hasValidValue(quoteRequest.emailAddress);

    if (hasAddress && hasSystemInfo && hasContact) {
      return QuoteStatus.CONTACT_INFO; // Ready for submission
    } else if (hasAddress && (hasSystemInfo || hasSkipToContactValue)) {
      return QuoteStatus.CONTACT_INFO; // Need contact info (either complete system info or skip conditions met)
    } else {
      return QuoteStatus.QUESTIONNAIRE; // Still collecting system info
    }
  }

  /**
   * Helper to check if field has a valid value (not empty string or undefined)
   */
  private hasValidValue(value: string | undefined): boolean {
    return Boolean(value && value.trim().length > 0);
  }

  /**
   * Validate that quote request is complete before submission
   */
  private validateQuoteRequestComplete(quoteRequest: QuoteRequest): void {
    const missingFields: string[] = [];

    // Address fields are always required
    if (!this.hasValidValue(quoteRequest.street)) missingFields.push('street');
    if (!this.hasValidValue(quoteRequest.city)) missingFields.push('city');
    if (!this.hasValidValue(quoteRequest.state)) missingFields.push('state');
    if (!this.hasValidValue(quoteRequest.zipCode))
      missingFields.push('zipCode');

    // AC unit quantity, system type, and heating type are now optional
    // (users may have selected "I don't know" which triggers smart progression)

    // Contact fields are always required
    if (!this.hasValidValue(quoteRequest.contactName))
      missingFields.push('contactName');
    if (!this.hasValidValue(quoteRequest.contactNumber))
      missingFields.push('contactNumber');
    if (!this.hasValidValue(quoteRequest.emailAddress))
      missingFields.push('emailAddress');

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Quote request is incomplete. Missing fields: ${missingFields.join(', ')}`,
      );
    }
  }

  /**
   * Determine if the questionnaire was completed with sufficient information
   */
  private isQuestionnaireComplete(quoteRequest: QuoteRequest): boolean {
    // Check if user provided specific (non-"I don't know") answers for key questions
    const hasSpecificACUnits =
      this.hasValidValue(quoteRequest.acUnitQuantity) &&
      quoteRequest.acUnitQuantity !== ACUnitQuantity.I_DONT_KNOW &&
      quoteRequest.acUnitQuantity !== ACUnitQuantity.MORE_THAN_THREE;

    const hasSpecificSystemType =
      this.hasValidValue(quoteRequest.systemType) &&
      quoteRequest.systemType !== SystemType.I_DONT_KNOW;

    const hasSpecificHeatingType =
      this.hasValidValue(quoteRequest.heatingType) &&
      quoteRequest.heatingType !== HeatingType.I_DONT_KNOW;

    return (
      hasSpecificACUnits && hasSpecificSystemType && hasSpecificHeatingType
    );
  }
}
