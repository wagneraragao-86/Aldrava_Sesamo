'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { env } from '@/lib/env';

export function useWebRtc(socket?: Socket, callId?: string) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [status, setStatus] = useState('aguardando');

  const ensurePeer = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: env.stunUrl }] });
    const remote = new MediaStream();
    setRemoteStream(remote);

    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => remote.addTrack(track));
      setStatus('video conectado');
    };
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && callId) {
        socket.emit('webrtc:ice-candidate', { callId, candidate: event.candidate.toJSON() });
      }
    };
    pc.onconnectionstatechange = () => setStatus(pc.connectionState);
    pcRef.current = pc;
    return pc;
  }, [callId, socket]);

  const startMedia = useCallback(async (facingMode: 'user' | 'environment' = 'user') => {
    localRef.current?.getTracks().forEach((track) => track.stop());
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    localRef.current = stream;
    setLocalStream(stream);
    const pc = ensurePeer();
    pc.getSenders().forEach((sender) => pc.removeTrack(sender));
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    return stream;
  }, [ensurePeer]);

  const createOffer = useCallback(async () => {
    const pc = ensurePeer();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket?.emit('webrtc:offer', { callId, description: offer });
  }, [callId, ensurePeer, socket]);

  const answerOffer = useCallback(
    async (description: RTCSessionDescriptionInit) => {
      const pc = ensurePeer();
      if (!localRef.current) await startMedia('user');
      await pc.setRemoteDescription(description);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket?.emit('webrtc:answer', { callId, description: answer });
    },
    [callId, ensurePeer, socket, startMedia],
  );

  const acceptAnswer = useCallback(async (description: RTCSessionDescriptionInit) => {
    await ensurePeer().setRemoteDescription(description);
  }, [ensurePeer]);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    await ensurePeer().addIceCandidate(candidate);
  }, [ensurePeer]);

  const toggleAudio = useCallback(() => {
    localRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  }, []);

  const toggleVideo = useCallback(() => {
    localRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  }, []);

  const close = useCallback(() => {
    localRef.current?.getTracks().forEach((track) => track.stop());
    pcRef.current?.close();
    pcRef.current = null;
    setLocalStream(undefined);
    setRemoteStream(undefined);
    setStatus('encerrada');
  }, []);

  useEffect(() => close, [close]);

  return useMemo(
    () => ({
      localStream,
      remoteStream,
      status,
      startMedia,
      createOffer,
      answerOffer,
      acceptAnswer,
      addIceCandidate,
      toggleAudio,
      toggleVideo,
      close,
    }),
    [
      acceptAnswer,
      addIceCandidate,
      answerOffer,
      close,
      createOffer,
      localStream,
      remoteStream,
      startMedia,
      status,
      toggleAudio,
      toggleVideo,
    ],
  );
}
