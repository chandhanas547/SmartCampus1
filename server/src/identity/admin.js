import { HttpError } from '../errors.js';
import { registrationInput, safeUser, userModel } from './user.js';
import { hashPassword } from './password.js';

export async function createAdministrator(connection, values) {
  const input = registrationInput.parse(values);
  const User = userModel(connection);
  if (await User.exists({ email: input.email })) throw new HttpError(409, 'DUPLICATE', 'Account already exists; no role was changed.');
  const user = await User.create({ name: input.name, email: input.email, passwordHash: await hashPassword(input.password), role: 'ADMIN' });
  return safeUser(user);
}
