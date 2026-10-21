import { Schema } from 'mongoose';
import { z } from 'zod';

export const emailInput = z.string().trim().toLowerCase().max(254).email();
export const passwordInput = z.string().min(12).max(128).refine((value) => Buffer.byteLength(value) <= 512);
export const registrationInput = z.strictObject({ name: z.string().trim().min(2).max(120), email: emailInput, password: passwordInput });
export const loginInput = z.strictObject({ email: emailInput, password: passwordInput });

export function userModel(connection) {
  return connection.models.User || connection.model('User', new Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT', required: true },
  }, { timestamps: true, strict: 'throw' }));
}

export function safeUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
}
