import { Router } from 'express';
import { openGateSchema } from '@aldrava/shared';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { prisma } from '../../config/prisma.js';
import { getRequestIp } from '../../http/request.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';

export const devicesRouter = Router();

devicesRouter.post('/open', requireAuth, validateBody(openGateSchema), async (req, res) => {
  const device = await prisma.device.findFirst({ where: { enabled: true, type: 'GATE_CONTROLLER' } });
  const baseUrl = device?.baseUrl ?? env.ESP32_BASE_URL;
  const startedAt = Date.now();

  try {
    const response = await fetch(`${baseUrl}/open`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.ESP32_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source: 'backend', callId: req.body.callId }),
      signal: AbortSignal.timeout(4000),
    });

    const ok = response.ok;
    await prisma.accessLog.create({
      data: {
        action: ok ? 'GATE_OPENED' : 'GATE_DENIED',
        callId: req.body.callId,
        userId: req.user?.sub,
        deviceId: device?.id,
        ip: getRequestIp(req),
        metadata: { status: response.status, durationMs: Date.now() - startedAt },
      },
    });

    if (!ok) return res.status(502).json({ message: 'ESP32 rejected open command' });
    return res.json({ ok: true });
  } catch (error) {
    logger.error({ error }, 'Failed to open gate');
    await prisma.accessLog.create({
      data: {
        action: 'GATE_DENIED',
        callId: req.body.callId,
        userId: req.user?.sub,
        deviceId: device?.id,
        ip: getRequestIp(req),
        metadata: { error: 'ESP32_UNREACHABLE' },
      },
    });
    return res.status(502).json({ message: 'ESP32 unreachable' });
  }
});
