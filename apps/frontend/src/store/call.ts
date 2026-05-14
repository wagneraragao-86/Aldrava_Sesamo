'use client';

import { create } from 'zustand';
import type { VisitorCallPayload } from '@aldrava/shared';

type CallState = {
  incoming?: VisitorCallPayload;
  activeCallId?: string;
  visitorSocketId?: string;
  setIncoming: (call?: VisitorCallPayload) => void;
  setActive: (callId?: string, visitorSocketId?: string) => void;
};

export const useCallStore = create<CallState>((set) => ({
  setIncoming: (incoming) => set({ incoming }),
  setActive: (activeCallId, visitorSocketId) => set({ activeCallId, visitorSocketId }),
}));
