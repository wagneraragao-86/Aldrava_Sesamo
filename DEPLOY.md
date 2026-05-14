# Deploy para teste real

Este MVP precisa de HTTPS para camera/microfone no celular e de um backend com WebSocket para Socket.IO. O caminho recomendado para teste e:

- Frontend: Vercel
- Backend: Railway
- Banco: Supabase

## 1. Backend no Railway

1. Suba este repositorio para o GitHub.
2. No Railway, crie um projeto a partir do repositorio.
3. Use o `railway.json` da raiz.
4. Configure as variaveis:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...supabase.co:5432/postgres?sslmode=require
JWT_SECRET=troque_por_um_segredo_forte
JWT_EXPIRES_IN=7d
ESP32_TOKEN=troque_por_um_token_forte
ESP32_BASE_URL=http://esp32.local
FRONTEND_URL=https://SEU-FRONTEND.vercel.app,http://localhost:3000
```

5. Depois do deploy, copie a URL publica do backend, por exemplo:

```text
https://aldrava-backend-production.up.railway.app
```

## 2. Frontend na Vercel

1. Importe o mesmo repositorio na Vercel.
2. Mantenha o root do projeto na raiz do monorepo.
3. A Vercel usa o `vercel.json` da raiz.
4. Configure as variaveis:

```env
NEXT_PUBLIC_API_URL=https://SUA-URL-DO-BACKEND.up.railway.app
NEXT_PUBLIC_SOCKET_URL=https://SUA-URL-DO-BACKEND.up.railway.app
NEXT_PUBLIC_STUN_URL=stun:stun.l.google.com:19302
NEXT_PUBLIC_VISITOR_URL=https://SEU-FRONTEND.vercel.app/visitante
```

5. Faca o deploy.
6. Volte ao Railway e atualize `FRONTEND_URL` com a URL final da Vercel.
7. Redeploy do backend.

## 3. Teste

1. Abra `https://SEU-FRONTEND.vercel.app/login`.
2. Entre com `morador@example.com` e `admin123`.
3. Acesse o dashboard e abra `QR Code`.
4. Escaneie pelo celular.
5. Permita camera/microfone.
6. Inicie a chamada.

## Observacoes importantes

- WebRTC P2P com STUN funciona em muitos cenarios, mas redes moveis e NAT restritivo podem exigir TURN.
- O ESP32 precisa estar acessivel pelo backend. Para teste remoto real, use VPN, tunnel seguro ou exponha um endpoint HTTPS protegido em uma rede controlada.
- Troque `JWT_SECRET`, `ESP32_TOKEN` e a senha do usuario demo antes de expor para terceiros.
