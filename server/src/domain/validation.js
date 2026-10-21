import { z } from 'zod';
import { EQUIPMENT_STATES, REQUEST_STATES } from './models.js';

export const id = z.string().regex(/^[a-fA-F0-9]{24}$/).transform((value) => value.toLowerCase());
export const note = z.string().trim().min(1).max(2000);
export const instant = z.iso.datetime({ offset: true }).transform((value) => new Date(value));
const text = (minimum, maximum) => z.string().trim().min(minimum).max(maximum);
const page = z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(z.number().int().max(10000)).default(1);
const limit = z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(z.number().int().max(50)).default(20);
const metadata = { name: text(2, 120), category: text(2, 80), description: text(0, 2000), location: text(2, 120), conditionNote: text(0, 2000) };
export const createEquipmentInput = z.strictObject({ ...metadata, description: metadata.description.default(''), conditionNote: metadata.conditionNote.default(''), assetTag: z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9._-]{1,39}$/) });
export const patchEquipmentInput = z.discriminatedUnion('action', [
  z.strictObject({ action: z.literal('EDIT_METADATA'), version: z.number().int().min(0), ...Object.fromEntries(Object.entries(metadata).map(([key, schema]) => [key, schema.optional()])) }).refine((value) => Object.keys(value).length > 2),
  ...['ENTER_MAINTENANCE', 'RESTORE'].map((action) => z.strictObject({ action: z.literal(action), version: z.number().int().min(0), note })),
]);
export const equipmentQuery = z.strictObject({ search: text(0, 80).optional(), category: text(2, 80).optional(), status: z.enum(EQUIPMENT_STATES).optional(), page, limit });
export const requestQuery = z.strictObject({ status: z.enum(REQUEST_STATES).optional(), overdue: z.enum(['true', 'false']).optional(), damage: z.enum(['true', 'false']).optional(), page, limit });
export const createRequestInput = z.strictObject({ equipmentId: id, purpose: text(10, 500), requestedDueAt: instant, requestKey: z.uuid() });
export const decisionInput = z.discriminatedUnion('action', [z.strictObject({ action: z.literal('APPROVE'), dueAt: instant }), z.strictObject({ action: z.literal('REJECT'), reason: note })]);
export const cancellationInput = z.strictObject({ reason: note.optional() });
export const returnInput = z.strictObject({ condition: z.enum(['SERVICEABLE', 'DAMAGED']), inspectionNote: note.optional() });
export const reportInput = z.strictObject({ description: note });
export const empty = z.strictObject({});
