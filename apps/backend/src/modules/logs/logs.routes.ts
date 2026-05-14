import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { requireAuth } from '../../middleware/auth.js';

export const logsRouter = Router();

logsRouter.get('/', requireAuth, async (_req, res) => {
  const logs = await prisma.accessLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } }, call: true, device: true },
  });
  res.json({ logs });
});
