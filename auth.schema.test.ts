import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Mocking the schema based on README (Email: morador@example.com, Password: admin123)
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

describe('Auth Schemas', () => {
  it('should validate a correct login payload', () => {
    const validData = {
      email: 'morador@example.com',
      password: 'admin123',
    };
    const result = LoginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail validation with an invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'admin123',
    };
    const result = LoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('email');
    }
  });

  it('should fail validation with a short password', () => {
    const invalidData = {
      email: 'morador@example.com',
      password: '123',
    };
    expect(LoginSchema.safeParse(invalidData).success).toBe(false);
  });
});
