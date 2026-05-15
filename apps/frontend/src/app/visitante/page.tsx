'use client';

import { useEffect, useState } from 'react';
import { Camera, Mic, Phone, PhoneOff, RefreshCw, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSocket } from '@/hooks/use-socket';
import { useVideoElement } from '@/hooks/use-video-element';
import { useWebRtc } from '@/hooks/use-webrtc';
import { apiFetch } from '@/lib/api';
import type { VisitorCallPayload } from '@aldrava/shared';

export default function VisitorPage() {
  const { socket, connected } = useSocket('visitor');
  const [call, setCall] = useState<VisitorCallPayload>();
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const rtc = useWebRtc(socket, call?.callId);
  const localVideo = useVideoElement(rtc.localStream);
  const remoteVideo = useVideoElement(rtc.remoteStream);

  useEffect(() => {
    if (!socket) return;
    socket.on('visitor:call-created', setCall);
    socket.on('visitor:call-answered', async () => {
      await rtc.startMedia(facing);
      window.setTimeout(() => void rtc.createOffer(), 600);
    });
    socket.on('visitor:call-rejected', () => rtc.close());
    socket.on('webrtc:answer', ({ description }) => description && rtc.acceptAnswer(description));
    socket.on('webrtc:ice-candidate', ({ candidate }) => candidate && rtc.addIceCandidate(candidate));
    socket.on('call:ended', () => rtc.close());
    return () => {
      socket.removeAllListeners('visitor:call-created');
      socket.removeAllListeners('visitor:call-answered');
      socket.removeAllListeners('visitor:call-rejected');
      socket.removeAllListeners('webrtc:answer');
      socket.removeAllListeners('webrtc:ice-candidate');
      socket.removeAllListeners('call:ended');
    };
  }, [facing, rtc, socket]);

  async function startCall() {
    if (!socket?.id) return;
    await rtc.startMedia(facing);
    const response = await apiFetch<{ call: VisitorCallPayload }>('/calls/visitor', {
      method: 'POST',
      body: JSON.stringify({ visitorName: 'Visitante', visitorSocketId: socket.id }),
    });
    setCall(response.call);
  }

  async function switchCamera() {
    const next = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    await rtc.startMedia(next);
  }

  function endCall() {
    if (call) socket?.emit('call:end', { callId: call.callId });
    rtc.close();
    setCall(undefined);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-5">
      <header>
        <p className="text-sm text-zinc-500">Portaria virtual</p>
        <h1 className="text-2xl font-bold">Chamar morador</h1>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-black">
        <video ref={remoteVideo} autoPlay playsInline className="aspect-[9/16] w-full object-cover" />
        <video
          ref={localVideo}
          autoPlay
          muted
          playsInline
          className="absolute bottom-3 right-3 aspect-[9/16] w-24 rounded-xl border border-white/30 object-cover"
        />
        {!rtc.localStream && (
          <div className="absolute inset-0 grid place-items-center text-center text-white">
            <div>
              <Camera className="mx-auto mb-3" />
              <p>Permita camera e microfone para iniciar.</p>
            </div>
          </div>
        )}
      </section>

      <Card className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Status</span>
          <span className="font-semibold text-sky-500">{connected ? rtc.status : 'socket desconectado'}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Button variant="secondary" onClick={rtc.toggleAudio} aria-label="Microfone">
            <Mic size={18} />
          </Button>
          <Button variant="secondary" onClick={rtc.toggleVideo} aria-label="Camera">
            <VideoOff size={18} />
          </Button>
          <Button variant="secondary" onClick={switchCamera} aria-label="Alternar camera">
            <RefreshCw size={18} />
          </Button>
          <Button variant="danger" onClick={endCall} aria-label="Encerrar">
            <PhoneOff size={18} />
          </Button>
        </div>
        <Button className="w-full" onClick={startCall} disabled={!connected || !socket?.id || Boolean(call)}>
          <Phone size={18} />
          {call ? 'Chamando...' : 'Iniciar chamada'}
        </Button>
      </Card>
    </main>
  );
}
