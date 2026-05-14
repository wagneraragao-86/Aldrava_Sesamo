import Link from 'next/link';
import { DoorOpen, QrCode, ShieldCheck, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <div className="grid size-9 place-items-center rounded-xl bg-sky-500 text-white">
            <DoorOpen size={20} />
          </div>
          Aldrava Sesamo
        </div>
        <Link href="/login">
          <Button variant="secondary">Entrar</Button>
        </Link>
      </nav>

      <section className="grid flex-1 place-items-center py-10">
        <div className="max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-600">Portaria virtual</p>
          <h1 className="text-4xl font-bold text-zinc-950 dark:text-white sm:text-6xl">
            Videochamada segura para liberar o acesso residencial.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-zinc-600 dark:text-zinc-300">
            Visitante chama pelo QR Code, morador atende no celular e libera o portao integrado ao ESP32.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/visitante">
              <Button>
                <QrCode size={18} /> Simular visitante
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">
                <Video size={18} /> Painel do morador
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 pb-6 sm:grid-cols-3">
        {[
          ['WebRTC P2P', 'Video em tempo real via navegador.'],
          ['Controle seguro', 'JWT, rate limit, helmet e token no ESP32.'],
          ['PWA', 'Instalavel e responsivo para celular.'],
        ].map(([title, body]) => (
          <Card key={title}>
            <ShieldCheck className="mb-3 text-sky-500" />
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{body}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
