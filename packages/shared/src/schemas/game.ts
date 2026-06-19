import { z } from 'zod';

export const characterClassIdSchema = z.enum(['TITAN', 'WRAITH', 'PRISM', 'ORACLE', 'VOID']);

export const lanePositionsSchema = z
  .array(z.number().int().min(0))
  .length(6, 'positions must contain exactly 6 lanes');

export const moveAllocationSchema = z.record(
  z.string().regex(/^[0-5]$/, 'lane index must be 0-5'),
  z.number().int().positive(),
);
