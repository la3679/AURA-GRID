import { z } from 'zod';
import { characterClassIdSchema } from './game.js';

export const callsignSchema = z
  .string()
  .min(3, 'Callsign must be at least 3 characters')
  .max(16, 'Callsign must be at most 16 characters')
  .regex(/^[A-Z0-9_-]+$/, 'Callsign must be uppercase alphanumeric (hyphen/underscore allowed)');

export const themePreferenceSchema = z.enum(['dark', 'light', 'system']);

export const userPreferencesSchema = z.object({
  theme: themePreferenceSchema,
  reducedMotion: z.boolean(),
  soundEnabled: z.boolean(),
  commentaryEnabled: z.boolean(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(40).optional(),
  callsign: callsignSchema.optional(),
  selectedClass: characterClassIdSchema.optional(),
  auraColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, 'auraColor must be a hex color')
    .optional(),
  photoURL: z.string().url().optional(),
  preferences: userPreferencesSchema.partial().optional(),
});

export const signupSchema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    callsign: callsignSchema,
    selectedClass: characterClassIdSchema,
    auraColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'auraColor must be a hex color'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
