import { Router } from 'express';
import type { VisitorCallPayload } from '@aldrava/shared';
import { prisma } from '../../config/prisma.js';
import { getRequestIp, getRouteParam } from '../../http/request.js';
import { requireAuth } from '../../middleware/auth.js';
import { publishVisitorCall } from '../../realtime/call-events.js';

export const callsRouter = Router();

export async function createVisitorCall(visitorSocketId: string, visitorName?: string): Promise<VisitorCallPayload> {
  const call = await prisma.call.create({
    data: {
      visitorName,
      visitorSocketId,
      status: 'RINGING',
      accessLogs: {
        create: {
          action: 'CALL_STARTED',
          metadata: { socketId: visitorSocketId },
        },
      },
    },
  });

  return {
    callId: call.id,
    visitorName,
    visitorSocketId,
    createdAt: call.createdAt.toISOString(),
  };
}

callsRouter.get('/', requireAuth, async (_req, res) => {
  const calls = await prisma.call.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { resident: { select: { id: true, name: true, email: true } } },
  });
  res.json({ calls });
});

callsRouter.post('/visitor', async (req, res) => {
  const visitorSocketId = typeof req.body?.visitorSocketId === 'string' ? req.body.visitorSocketId.trim() : '';
  const visitorName = typeof req.body?.visitorName === 'string' ? req.body.visitorName.trim() : undefined;

  if (!visitorSocketId) return res.status(400).json({ message: 'Missing visitorSocketId' });

  const call = await createVisitorCall(visitorSocketId, visitorName || undefined);
  publishVisitorCall(call);
  res.status(201).json({ call });
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
