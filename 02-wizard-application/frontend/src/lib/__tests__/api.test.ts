import { wizardApiService } from '@/lib/api';
import { ACUnitQuantity } from '@/types/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('WizardApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuoteRequest', () => {
    it('creates a new quote request', async () => {
      const mockResponse = { sessionId: 'test-session-123' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await wizardApiService.createQuoteRequest();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/quote_request',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failed request', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      });

      await expect(wizardApiService.createQuoteRequest()).rejects.toThrow(
        'API request failed: 500 Internal Server Error - Server error',
      );
    });
  });

  describe('getQuoteRequest', () => {
    it('retrieves quote request by session ID', async () => {
      const mockQuoteRequest = {
        sessionId: 'test-session',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        status: 'questionnaire',
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuoteRequest),
      });

      const result = await wizardApiService.getQuoteRequest('test-session');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/quote_request/test-session',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      expect(result).toEqual(mockQuoteRequest);
    });
  });

  describe('updateQuoteRequest', () => {
    it('updates quote request with address data', async () => {
      const sessionId = 'test-session';
      const updateData = {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      };
      const mockResponse = {
        ...updateData,
        sessionId,
        status: 'questionnaire',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await wizardApiService.updateQuoteRequest(
        sessionId,
        updateData,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/quote_request/${sessionId}`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('updates quote request with AC unit data', async () => {
      const sessionId = 'test-session';
      const updateData = {
        acUnitQuantity: ACUnitQuantity.TWO,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            sessionId,
            ...updateData,
            status: 'questionnaire',
          }),
      });

      await wizardApiService.updateQuoteRequest(sessionId, updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/quote_request/${sessionId}`,
        expect.objectContaining({
          body: JSON.stringify(updateData),
        }),
      );
    });
  });

  describe('submitQuoteRequest', () => {
    it('submits final quote request with contact info', async () => {
      const sessionId = 'test-session';
      const contactData = {
        contactName: 'John Doe',
        contactNumber: '555-1234',
        emailAddress: 'john@example.com',
      };
      const mockResponse = {
        sessionId,
        ...contactData,
        status: 'submitted',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await wizardApiService.submitQuoteRequest(
        sessionId,
        contactData,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/quote_request/${sessionId}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(wizardApiService.createQuoteRequest()).rejects.toThrow(
        'Network error',
      );
    });

    it('handles non-JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid request'),
      });

      await expect(wizardApiService.createQuoteRequest()).rejects.toThrow(
        'API request failed: 400 Bad Request - Invalid request',
      );
    });
  });
});
