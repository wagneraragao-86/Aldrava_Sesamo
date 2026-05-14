'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DoorOpen, Mic, PhoneOff, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/toast';
import { useSocket } from '@/hooks/use-socket';
import { useVideoElement } from '@/hooks/use-video-element';
import { useWebRtc } from '@/hooks/use-webrtc';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useCallStore } from '@/store/call';

export default function CallPage() {
  const router = useRouter();
  const toast = useToast((state) => state.show);
  const token = useAuthStore((state) => state.token);
  const callId = useCallStore((state) => state.activeCallId);
  const clearActive = useCallStore((state) => state.setActive);
  const { socket, connected } = useSocket('resident', token);
  const rtc = useWebRtc(socket, callId);
  const localVideo = useVideoElement(rtc.localStream);
  const remoteVideo = useVideoElement(rtc.remoteStream);

  useEffect(() => {
    if (!token) router.replace('/login');
    if (!callId) router.replace('/dashboard');
  }, [callId, router, token]);

  useEffect(() => {
    if (!socket) return;
    if (callId) socket.emit('resident:join-call', { callId });
    socket.on('webrtc:offer', ({ description }) => description && rtc.answerOffer(description));
    socket.on('webrtc:ice-candidate', ({ candidate }) => candidate && rtc.addIceCandidate(candidate));
    socket.on('call:ended', () => {
      rtc.close();
      clearActive(undefined);
      router.push('/dashboard');
    });
    return () => {
      socket.removeAllListeners('webrtc:offer');
      socket.removeAllListeners('webrtc:ice-candidate');
      socket.removeAllListeners('call:ended');
    };
  }, [clearActive, router, rtc, socket]);

  async function openGate() {
    if (!token) return;
    try {
      await apiFetch('/devices/open', { method: 'POST', body: JSON.stringify({ callId }) }, token);
      toast('Portao acionado');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Falha ao abrir');
    }
  }

  function endCall() {
    if (callId) socket?.emit('call:end', { callId });
    rtc.close();
    clearActive(undefined);
    router.push('/dashboard');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-5">
      <header>
        <p className="text-sm text-zinc-500">{connected ? 'Conectado' : 'Reconectando'}</p>
        <h1 className="text-2xl font-bold">Chamada em andamento</h1>
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
        {!rtc.remoteStream && <div className="absolute inset-0 grid place-items-center text-white">Aguardando video...</div>}
      </section>

      <Card className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Status WebRTC</span>
          <span className="font-semibold text-sky-500">{rtc.status}</span>
        </div>
        <Button className="w-full" onClick={openGate}>
          <DoorOpen size={18} /> Abrir portao
        </Button>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" onClick={rtc.toggleAudio} aria-label="Microfone">
            <Mic size={18} />
          </Button>
          <Button variant="secondary" onClick={rtc.toggleVideo} aria-label="Camera">
            <VideoOff size={18} />
          </Button>
          <Button variant="danger" onClick={endCall} aria-label="Encerrar">
            <PhoneOff size={18} />
          </Button>
        </div>
      </Card>
    </main>
  );
}
