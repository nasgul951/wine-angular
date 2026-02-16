import { getPasswordErrors } from './password-input';

describe('getPasswordErrors', () => {
  it('returns null when empty and not required', () => {
    expect(getPasswordErrors('', '', false)).toBeNull();
  });

  it('returns "Password is required" when empty and required', () => {
    expect(getPasswordErrors('', '')).toBe('Password is required');
  });

  it('returns complexity error for password missing uppercase', () => {
    expect(getPasswordErrors('test1234!', 'test1234!')).toBe(
      'Password does not meet complexity requirements',
    );
  });

  it('returns complexity error for password missing lowercase', () => {
    expect(getPasswordErrors('TEST1234!', 'TEST1234!')).toBe(
      'Password does not meet complexity requirements',
    );
  });

  it('returns complexity error for password missing number', () => {
    expect(getPasswordErrors('Testtest!', 'Testtest!')).toBe(
      'Password does not meet complexity requirements',
    );
  });

  it('returns complexity error for password missing special character', () => {
    expect(getPasswordErrors('Test1234x', 'Test1234x')).toBe(
      'Password does not meet complexity requirements',
    );
  });

  it('returns complexity error for password shorter than 8 characters', () => {
    expect(getPasswordErrors('Te1!', 'Te1!')).toBe(
      'Password does not meet complexity requirements',
    );
  });

  it('returns "Passwords do not match" when passwords differ', () => {
    expect(getPasswordErrors('Test1234!', 'Test1234?')).toBe(
      'Passwords do not match',
    );
  });

  it('returns null for a valid matching pair', () => {
    expect(getPasswordErrors('Test1234!', 'Test1234!')).toBeNull();
  });
});
