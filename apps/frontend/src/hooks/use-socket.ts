'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { env } from '@/lib/env';

export function useSocket(role: 'visitor' | 'resident', token?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (role === 'resident' && !token) return;

    const socket = io(env.socketUrl, {
      auth: { role, token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [role, token]);

  return { socket: socketRef.current ?? undefined, connected };
}
