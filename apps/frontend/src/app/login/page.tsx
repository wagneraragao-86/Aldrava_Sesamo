'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/toast';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast((state) => state.show);
  const setSession = useAuthStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const session = await apiFetch<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      });
      setSession(session.token, session.user);
      toast('Login realizado');
      router.push('/dashboard');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Falha no login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-sky-500 text-white">
            <LockKeyhole size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Acesso do morador</h1>
            <p className="text-sm text-zinc-500">morador@example.com / admin123</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input name="email" type="email" defaultValue="morador@example.com" placeholder="E-mail" required />
          <Input name="password" type="password" defaultValue="admin123" placeholder="Senha" required />
          <Button className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
