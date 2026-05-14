'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

type Call = {
  id: string;
  visitorName?: string;
  status: string;
  createdAt: string;
  answeredAt?: string;
  endedAt?: string;
};

export default function HistoryPage() {
  const token = useAuthStore((state) => state.token);
  const { data, isLoading } = useQuery({
    queryKey: ['calls'],
    queryFn: () => apiFetch<{ calls: Call[] }>('/calls', {}, token),
    enabled: Boolean(token),
  });

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5">
      <header className="mb-5 flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" aria-label="Voltar">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <p className="text-sm text-zinc-500">Registros recentes</p>
          <h1 className="text-2xl font-bold">Historico</h1>
        </div>
      </header>

      <div className="space-y-3">
        {isLoading &&
          [1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-900" />)}
        {data?.calls.map((call) => (
          <Card key={call.id}>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="font-semibold">{call.visitorName ?? 'Visitante'}</h2>
                <p className="text-sm text-zinc-500">
                  {call.status} · {new Date(call.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
