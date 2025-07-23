import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  ValidationPipe,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WizardService } from '../services/wizard.service';
import {
  QuoteRequest as QuoteRequestDto,
  SubmitQuoteRequest,
} from '../dto/wizard.dto';

@Controller('api')
export class WizardController {
  private readonly logger = new Logger(WizardController.name);

  constructor(private readonly wizardService: WizardService) {}

  /**
   * Health check endpoint
   * GET /health
   */
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'wizard-backend',
    };
  }

  /**
   * Create new quote request with empty object and session ID
   * POST /quote_request
   */
  @Post('quote_request')
  @HttpCode(HttpStatus.CREATED)
  async createQuoteRequest(): Promise<{ sessionId: string }> {
    this.logger.log('Creating new quote request');

    const result = await this.wizardService.createQuoteRequest();

    this.logger.log(
      `Created quote request with session ID: ${result.sessionId}`,
    );
    return result;
  }

  /**
   * Get current quote request state
   * GET /quote_request/:sessionId
   */
  @Get('quote_request/:sessionId')
  async getQuoteRequest(
    @Param('sessionId') sessionId: string,
  ): Promise<QuoteRequestDto> {
    this.logger.log(`Fetching quote request: ${sessionId}`);

    const quoteRequest = await this.wizardService.getQuoteRequest(sessionId);

    this.logger.log(`Returning quote request data for: ${sessionId}`, {
      status: quoteRequest.status,
    });

    return quoteRequest;
  }

  /**
   * Update quote request with validation
   * PATCH /quote_request/:sessionId
   */
  @Patch('quote_request/:sessionId')
  async updateQuoteRequest(
    @Param('sessionId') sessionId: string,
    @Body(ValidationPipe) updateData: Partial<QuoteRequestDto>,
  ): Promise<QuoteRequestDto> {
    this.logger.log(`Updating quote request: ${sessionId}`, {
      sessionId,
      updateFields: Object.keys(updateData),
    });

    const updatedQuoteRequest = await this.wizardService.updateQuoteRequest(
      sessionId,
      updateData,
    );

    this.logger.log(`Successfully updated quote request: ${sessionId}`, {
      status: updatedQuoteRequest.status,
    });

    return updatedQuoteRequest;
  }

  /**
   * Submit/complete quote request with contact information
   * POST /quote_request/:sessionId
   */
  @Post('quote_request/:sessionId')
  async submitQuoteRequest(
    @Param('sessionId') sessionId: string,
    @Body(ValidationPipe) submitData: SubmitQuoteRequest,
  ): Promise<QuoteRequestDto> {
    this.logger.log(`Submitting quote request: ${sessionId}`);

    const submittedQuoteRequest = await this.wizardService.submitQuoteRequest(
      sessionId,
      submitData,
    );

    this.logger.log(`Successfully submitted quote request: ${sessionId}`);

    return submittedQuoteRequest;
  }
}
