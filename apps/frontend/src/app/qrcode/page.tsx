'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowLeft, Copy, ExternalLink, QrCode, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/toast';
import { env } from '@/lib/env';

export default function QrCodePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toast = useToast((state) => state.show);
  const [customUrl, setCustomUrl] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const visitorUrl = useMemo(() => {
    return customUrl.trim() || env.visitorUrl || `${origin}/visitante`;
  }, [customUrl, origin]);

  useEffect(() => {
    if (!canvasRef.current || !visitorUrl) return;
    QRCode.toCanvas(canvasRef.current, visitorUrl, {
      width: 288,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    }).catch(() => toast('Nao foi possivel gerar o QR Code'));
  }, [toast, visitorUrl]);

  async function copyUrl() {
    await navigator.clipboard.writeText(visitorUrl);
    toast('Link copiado');
  }

  function useCurrentOrigin() {
    setCustomUrl(`${window.location.origin}/visitante`);
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5">
      <header className="mb-5 flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" aria-label="Voltar">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <p className="text-sm text-zinc-500">Acesso do visitante</p>
          <h1 className="text-2xl font-bold">QR Code da portaria</h1>
        </div>
      </header>

      <Card className="mb-4 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-sky-500 text-white">
          <QrCode size={24} />
        </div>
        <div className="mx-auto w-fit rounded-2xl bg-white p-3">
          <canvas ref={canvasRef} width={288} height={288} aria-label="QR Code do visitante" />
        </div>
        <p className="mt-4 break-all text-sm text-zinc-500">{visitorUrl}</p>
      </Card>

      <Card className="space-y-3">
        <Input
          value={customUrl}
          onChange={(event) => setCustomUrl(event.target.value)}
          placeholder="URL publica ou IP da maquina para o visitante"
        />
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" onClick={copyUrl} aria-label="Copiar link">
            <Copy size={18} />
          </Button>
          <Button variant="secondary" onClick={useCurrentOrigin} aria-label="Usar origem atual">
            <RefreshCw size={18} />
          </Button>
          <a href={visitorUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="w-full" aria-label="Abrir link">
              <ExternalLink size={18} />
            </Button>
          </a>
        </div>
      </Card>

      <p className="mt-4 text-sm text-zinc-500">
        Para testar no celular, use o IP da maquina na rede, por exemplo
        {' '}http://SEU-IP:3000/visitante. QR com localhost funciona apenas no mesmo computador.
      </p>
    </main>
  );
}
