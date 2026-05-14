import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaRegister } from '@/components/pwa-register';
import { QueryProvider } from '@/components/query-provider';
import { Toast } from '@/components/toast';

export const metadata: Metadata = {
  title: 'Aldrava Sesamo',
  description: 'Portaria virtual residencial com videochamada e abertura remota.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Aldrava' },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <PwaRegister />
          {children}
          <Toast />
        </QueryProvider>
      </body>
    </html>
  );
}
