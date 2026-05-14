import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { getRequestIp, getRouteParam } from '../../http/request.js';
import { requireAuth } from '../../middleware/auth.js';

export const callsRouter = Router();

callsRouter.get('/', requireAuth, async (_req, res) => {
  const calls = await prisma.call.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { resident: { select: { id: true, name: true, email: true } } },
  });
  res.json({ calls });
});

callsRouter.post('/:callId/end', requireAuth, async (req, res) => {
  const callId = getRouteParam(req, 'callId');
  if (!callId) return res.status(400).json({ message: 'Missing callId' });

  const call = await prisma.call.update({
    where: { id: callId },
    data: { status: 'ENDED', endedAt: new Date() },
  });
  await prisma.accessLog.create({
    data: { action: 'CALL_ENDED', callId: call.id, userId: req.user?.sub, ip: getRequestIp(req) },
  });
  res.json({ call });
});
