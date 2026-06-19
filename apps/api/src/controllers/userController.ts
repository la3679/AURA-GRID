import type { Request, Response } from 'express';
import type { UpdateProfileInput } from '@aura-grid/shared';
import { NotFoundError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { getProfile, updateProfile, upsertProfile } from '../services/users/userService.js';

const uidOf = (res: Response): string => res.locals.uid as string;

/** POST /api/auth/session — verify token (via middleware) and bootstrap a profile. */
export const createSession = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as Partial<UpdateProfileInput> & {
    callsign?: string;
    selectedClass?: string;
    auraColor?: string;
  };
  const email = (res.locals.email as string) ?? '';
  const profile = await upsertProfile({
    uid: uidOf(res),
    email,
    displayName: body.displayName ?? body.callsign ?? 'OPERATIVE',
    callsign: body.callsign ?? 'OPERATIVE',
    selectedClass: (body.selectedClass as never) ?? 'TITAN',
    auraColor: body.auraColor ?? '#00f3ff',
  });
  sendSuccess(res, profile);
};

export const getMe = async (_req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'private, no-store');
  const profile = await getProfile(uidOf(res));
  if (!profile) throw new NotFoundError('Profile not found. Complete signup first.');
  sendSuccess(res, profile);
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  const profile = await updateProfile(uidOf(res), req.body as UpdateProfileInput);
  sendSuccess(res, profile);
};

export const getMyStats = async (_req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'private, no-store');
  const profile = await getProfile(uidOf(res));
  if (!profile) throw new NotFoundError('Profile not found.');
  sendSuccess(res, profile.stats);
};
