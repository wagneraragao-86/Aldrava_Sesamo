import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const openGateSchema = z.object({
  callId: z.string().cuid().optional(),
  reason: z.string().max(120).optional(),
});

export const callStatusValues = ['RINGING', 'ANSWERED', 'REJECTED', 'ENDED', 'MISSED'] as const;
export type CallStatus = (typeof callStatusValues)[number];

export type JwtUser = {
  sub: string;
  email: string;
  name: string;
  role: 'RESIDENT' | 'ADMIN';
};

export type VisitorCallPayload = {
  callId: string;
  visitorName?: string;
  visitorSocketId: string;
  createdAt: string;
};

export type SignalPayload = {
  callId: string;
  targetSocketId?: string;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};
