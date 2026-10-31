import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72)
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/[0-9]/, 'Needs a number'),
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  region: z.string().trim().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(72)
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/[0-9]/, 'Needs a number'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  region: z.string().trim().max(100).optional(),
  language: z.enum(['en', 'hi', 'bn', 'te', 'ta', 'mr']).optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1),
});
