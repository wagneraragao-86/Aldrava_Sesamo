import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@aldrava/shared';
import { prisma } from '../../config/prisma.js';
import { signToken } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  const isValid = user ? await bcrypt.compare(req.body.password, user.passwordHash) : false;

  if (!user || !isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});
