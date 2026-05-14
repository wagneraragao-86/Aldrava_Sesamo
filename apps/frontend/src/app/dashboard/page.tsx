'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BellRing, DoorOpen, History, LogOut, PhoneIncoming, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSocket } from '@/hooks/use-socket';
import { useAuthStore } from '@/store/auth';
import { useCallStore } from '@/store/call';

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, logout } = useAuthStore();
  const incoming = useCallStore((state) => state.incoming);
  const setIncoming = useCallStore((state) => state.setIncoming);
  const setActive = useCallStore((state) => state.setActive);
  const { socket, connected } = useSocket('resident', token);

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [router, token]);

  useEffect(() => {
    if (!socket) return;
    socket.on('resident:incoming-call', setIncoming);
    return () => {
      socket.removeAllListeners('resident:incoming-call');
    };
  }, [setIncoming, socket]);

  function answer() {
    if (!incoming) return;
    socket?.emit('resident:answer-call', incoming);
    setActive(incoming.callId, incoming.visitorSocketId);
    router.push('/chamada');
  }

  function reject() {
    if (!incoming) return;
    socket?.emit('resident:reject-call', incoming);
    setIncoming(undefined);
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">Bem-vindo</p>
          <h1 className="text-2xl font-bold">{user?.name ?? 'Morador'}</h1>
        </div>
        <Button variant="ghost" onClick={logout} aria-label="Sair">
          <LogOut size={18} />
        </Button>
      </header>

      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-sky-500 text-white">
            <DoorOpen size={20} />
          </div>
          <div>
            <h2 className="font-semibold">Portao principal</h2>
            <p className="text-sm text-zinc-500">{connected ? 'Online para chamadas' : 'Conectando...'}</p>
          </div>
        </div>
      </Card>

      {incoming ? (
        <Card className="mb-4 border-sky-300 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30">
          <div className="mb-4 flex items-center gap-3">
            <BellRing className="text-sky-500" />
            <div>
              <h2 className="font-semibold">Visitante chamando</h2>
              <p className="text-sm text-zinc-500">{new Date(incoming.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={answer}>
              <PhoneIncoming size={18} /> Atender
            </Button>
            <Button variant="danger" onClick={reject}>
              Rejeitar
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mb-4">
          <h2 className="font-semibold">Nenhuma chamada ativa</h2>
          <p className="mt-1 text-sm text-zinc-500">Quando alguem escanear o QR Code, a chamada aparece aqui.</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Link href="/qrcode">
          <Button variant="secondary" className="w-full">
            <QrCode size={18} /> QR Code
          </Button>
        </Link>
        <Link href="/historico">
          <Button variant="secondary" className="w-full">
            <History size={18} /> Historico
          </Button>
        </Link>
      </div>
    </main>
  );
}
