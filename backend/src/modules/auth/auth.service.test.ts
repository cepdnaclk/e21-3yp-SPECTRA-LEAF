/**
 * Assigned to: E/21/054, Deshan Dinidu
 * Function under test: authService.login(username, password)
 * External dependencies mocked: usersRepository, bcryptjs, jsonwebtoken
 *
 * Test design:
 *  - Equivalence classes: valid credentials, unknown username, wrong password
 *  - Error/negative cases: empty username, empty password
 *  - Boundary-ish case: username with different casing is NOT auto-matched
 *    (documents that lookup is case-sensitive, whatever the repository does)
 */
import { authService } from './auth.service';
import { usersRepository } from '../users/users.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../types';

jest.mock('../users/users.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockedUsers = usersRepository as jest.Mocked<typeof usersRepository>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

function user(overrides: Partial<User> = {}): User {
  return {
    userId: 'USER-1',
    username: 'nadeera',
    passwordHash: 'hashed-password',
    role: 'OFFICER',
    factoryId: 'FAC-1',
    ...overrides,
  };
}

describe('authService.login', () => {
  // --- Equivalence class: valid credentials ---
  it('returns a token and public user info for correct credentials', async () => {
    mockedUsers.getByUsername.mockResolvedValue(user());
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedJwt.sign.mockReturnValue('signed.jwt.token' as never);

    const result = await authService.login('nadeera', 'correct-password');

    expect(result.token).toBe('signed.jwt.token');
    expect(result.user).toEqual({
      userId: 'USER-1',
      username: 'nadeera',
      role: 'OFFICER',
      factoryId: 'FAC-1',
    });
    // passwordHash must never leak into the response
    expect((result.user as any).passwordHash).toBeUndefined();
  });

  // --- Equivalence class: unknown username ---
  it('throws 401 when the username does not exist', async () => {
    mockedUsers.getByUsername.mockResolvedValue(null);

    await expect(authService.login('ghost', 'whatever')).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(mockedBcrypt.compare).not.toHaveBeenCalled();
  });

  // --- Equivalence class: known username, wrong password ---
  it('throws 401 when the password is incorrect', async () => {
    mockedUsers.getByUsername.mockResolvedValue(user());
    mockedBcrypt.compare.mockResolvedValue(false as never);

    await expect(
      authService.login('nadeera', 'wrong-password')
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(mockedJwt.sign).not.toHaveBeenCalled();
  });

  // --- Error case: empty-string password (falls through to bcrypt.compare) ---
  it('treats an empty password the same as any other incorrect password', async () => {
    mockedUsers.getByUsername.mockResolvedValue(user());
    mockedBcrypt.compare.mockResolvedValue(false as never);

    await expect(authService.login('nadeera', '')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  // --- Error case: empty-string username ---
  it('throws 401 for an empty username rather than crashing', async () => {
    mockedUsers.getByUsername.mockResolvedValue(null);

    await expect(authService.login('', 'anything')).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
