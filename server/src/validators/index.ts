import { z } from 'zod';

export const phoneRegex = /^\+?[1-9]\d{9,14}$/;

export const sendOtpSchema = z.object({
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(phoneRegex, 'Please enter a valid phone number with country code (e.g., +919876543210)'),
});

export const verifyOtpSchema = z.object({
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(phoneRegex, 'Invalid phone number format'),
  otp: z
    .string({ required_error: 'OTP is required' })
    .trim()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export const createLoanSchema = z.object({
  friendName: z
    .string({ required_error: 'Friend name is required' })
    .trim()
    .min(2, 'Friend name must be at least 2 characters')
    .max(100, 'Friend name must not exceed 100 characters'),
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than zero')
    .max(100000000, 'Amount cannot exceed ₹10,00,00,000')
    .refine(
      (val) => Math.round(val * 100) / 100 === val,
      'Amount cannot have more than 2 decimal places'
    ),
  dueDate: z
    .string({ required_error: 'Due date is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Due date must be a valid ISO date string',
    }),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const loanIdParamSchema = z.object({
  id: z.string().uuid('Invalid loan ID format. Must be a valid UUID.'),
});
