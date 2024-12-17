import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const INTERCOM_API_BASE = 'https://api.intercom.io';

export class IntercomClient {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.INTERCOM_API_KEY;
    if (!apiKey) {
      throw new Error('INTERCOM_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(path, INTERCOM_API_BASE);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Intercom API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async getConversations(params: {
    startDate?: Date;
    endDate?: Date;
    customer?: string;
    state?: string;
  } = {}) {
    const queryParams: Record<string, string> = {};
    
    if (params.startDate) {
      queryParams['created_after'] = Math.floor(params.startDate.getTime() / 1000).toString();
    }
    if (params.endDate) {
      queryParams['created_before'] = Math.floor(params.endDate.getTime() / 1000).toString();
    }
    if (params.customer) {
      queryParams['customer_id'] = params.customer;
    }
    if (params.state) {
      queryParams['state'] = params.state;
    }

    return this.request<{ conversations: IntercomConversation[] }>('/conversations', queryParams);
  }
}