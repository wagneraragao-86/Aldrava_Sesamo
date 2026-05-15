import type { Server } from 'node:http';
import jwt from 'jsonwebtoken';
import { Server as SocketServer } from 'socket.io';
import type { JwtUser, SignalPayload, VisitorCallPayload } from '@aldrava/shared';
import { allowedOrigins, env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { prisma } from '../config/prisma.js';
import { createVisitorCall } from '../modules/calls/calls.routes.js';
import { publishVisitorCall, registerCallRealtime } from './call-events.js';

type AuthedSocketData = {
  user?: JwtUser;
  role: 'visitor' | 'resident';
};

const residentRoom = 'residents';

export function createRealtimeServer(server: Server) {
  const io = new SocketServer(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });
  registerCallRealtime(io, residentRoom);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    const role = socket.handshake.auth?.role === 'resident' ? 'resident' : 'visitor';
    const data = socket.data as AuthedSocketData;
    data.role = role;

    if (role === 'resident') {
      if (!token) return next(new Error('Missing token'));
      try {
        data.user = jwt.verify(token, env.JWT_SECRET) as JwtUser;
      } catch {
        return next(new Error('Invalid token'));
      }
    }

    return next();
  });

  io.on('connection', (socket) => {
    const data = socket.data as AuthedSocketData;
    logger.info({ socketId: socket.id, role: data.role }, 'socket connected');

    if (data.role === 'resident') {
      socket.join(residentRoom);
      socket.emit('resident:ready');
    }

    socket.on('visitor:start-call', async ({ visitorName }: { visitorName?: string } = {}) => {
      const payload = await createVisitorCall(socket.id, visitorName);
      publishVisitorCall(payload);
    });

    socket.on('resident:answer-call', async ({ callId, visitorSocketId }: VisitorCallPayload) => {
      await prisma.call.update({
        where: { id: callId },
        data: { status: 'ANSWERED', answeredAt: new Date(), residentId: data.user?.sub },
      });
      await prisma.accessLog.create({
        data: { action: 'CALL_ANSWERED', callId, userId: data.user?.sub },
      });
      socket.join(callId);
      io.to(visitorSocketId).emit('visitor:call-answered', { callId, residentSocketId: socket.id });
    });

    socket.on('resident:join-call', ({ callId }: { callId: string }) => {
      socket.join(callId);
    });

    socket.on('resident:reject-call', async ({ callId, visitorSocketId }: VisitorCallPayload) => {
      await prisma.call.update({ where: { id: callId }, data: { status: 'REJECTED', endedAt: new Date() } });
      await prisma.accessLog.create({
        data: { action: 'CALL_REJECTED', callId, userId: data.user?.sub },
      });
      io.to(visitorSocketId).emit('visitor:call-rejected', { callId });
    });

    socket.on('webrtc:offer', (payload: SignalPayload) => {
      socket.to(payload.callId).emit('webrtc:offer', { ...payload, targetSocketId: socket.id });
      if (payload.targetSocketId) socket.to(payload.targetSocketId).emit('webrtc:offer', payload);
    });

    socket.on('webrtc:answer', (payload: SignalPayload) => {
      socket.to(payload.callId).emit('webrtc:answer', { ...payload, targetSocketId: socket.id });
      if (payload.targetSocketId) socket.to(payload.targetSocketId).emit('webrtc:answer', payload);
    });

    socket.on('webrtc:ice-candidate', (payload: SignalPayload) => {
      socket.to(payload.callId).emit('webrtc:ice-candidate', { ...payload, targetSocketId: socket.id });
      if (payload.targetSocketId) socket.to(payload.targetSocketId).emit('webrtc:ice-candidate', payload);
    });

    socket.on('call:end', async ({ callId }: { callId: string }) => {
      await prisma.call.update({ where: { id: callId }, data: { status: 'ENDED', endedAt: new Date() } }).catch(() => null);
      socket.to(callId).emit('call:ended', { callId });
      socket.leave(callId);
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'socket disconnected');
    });
  });

  return io;
}
