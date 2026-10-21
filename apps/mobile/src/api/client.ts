import { Platform } from 'react-native';
import { storage } from '../utils/storage';
import { Loan, SummaryData, User } from '../types';

export function getApiBaseUrl(): string {
  let envUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

  // Android emulator localhost redirection
  if (Platform.OS === 'android' && envUrl.includes('localhost')) {
    envUrl = envUrl.replace('localhost', '10.0.2.2');
  }

  return envUrl;
}

export class ApiError extends Error {
  public statusCode: number;
  public issues?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode = 400, issues?: Array<{ field: string; message: string }>) {
    super(message);
    this.statusCode = statusCode;
    this.issues = issues;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const token = await storage.getItem('auth_token');

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data?.issues);
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = (err as Error)?.message || 'Unable to connect to server. Check your network connection.';
    throw new ApiError(message, 503);
  }
}

export const api = {
  // Auth
  async sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string; cooldownSeconds?: number }> {
    return request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  },

  async verifyOtp(
    phoneNumber: string,
    otp: string
  ): Promise<{ success: boolean; token: string; user: User }> {
    return request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    return request('/api/auth/me', {
      method: 'GET',
    });
  },

  // Loans
  async getLoans(status?: string, search?: string): Promise<{ success: boolean; count: number; data: Loan[] }> {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/loans${query}`, {
      method: 'GET',
    });
  },

  async createLoan(data: {
    friendName: string;
    amount: number;
    dueDate: string;
    notes?: string;
  }): Promise<{ success: boolean; data: Loan }> {
    return request('/api/loans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async repayLoan(loanId: string): Promise<{ success: boolean; data: Loan }> {
    return request(`/api/loans/${loanId}/repay`, {
      method: 'PATCH',
    });
  },

  // Summary
  async getSummary(): Promise<{ success: boolean; data: SummaryData }> {
    return request('/api/summary', {
      method: 'GET',
    });
  },

  // Upload receipt
  async uploadReceipt(loanId: string, imageUri: string): Promise<{ success: boolean; data: Loan }> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || `receipt-${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // @ts-ignore: React Native FormData file specification
    formData.append('receipt', {
      uri: imageUri,
      name: filename,
      type,
    });

    return request(`/api/loans/${loanId}/receipt`, {
      method: 'POST',
      body: formData,
    });
  },
};
