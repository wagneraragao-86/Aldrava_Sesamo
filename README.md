# Aldrava Sesamo

MVP funcional de portaria virtual residencial com WebRTC P2P, Next.js, Node.js, Socket.IO, PostgreSQL, Prisma, Docker, Nginx e ESP32.

## Arquitetura

```text
apps/
  frontend/   Next.js 15, React, TypeScript, TailwindCSS, PWA, WebRTC
  backend/    Express, Socket.IO, JWT, Prisma, PostgreSQL
packages/
  shared/     DTOs, schemas Zod e tipos compartilhados
infra/
  nginx/      reverse proxy com websocket e headers
  docker/     Dockerfiles
iot/
  esp32/      firmware do controlador de rele
```

## Execucao local com Docker

```bash
cp .env.example .env
docker compose up --build
```

Servicos:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Swagger: `http://localhost:3001/docs`
- Healthcheck: `http://localhost:3001/health`
- Nginx: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

Usuario seed:

- Email: `morador@example.com`
- Senha: `admin123`

## Fluxo do MVP

1. Visitante abre `http://localhost:3000/visitante`.
2. Visitante permite camera/microfone e inicia chamada.
3. Morador entra em `http://localhost:3000/login`.
4. Dashboard recebe a chamada em tempo real via Socket.IO.
5. Morador atende, recebe o video WebRTC e pode abrir o portao.
6. Backend envia `POST /open` ao ESP32 com token Bearer.

## Desenvolvimento sem Docker

```powershell
.\scripts\setup-local.ps1
npm run dev
```

Em ambiente local fora do Docker, ajuste `apps/backend/.env` ou `.env`:

```env
DATABASE_URL=postgresql://aldrava:aldrava_password@localhost:5432/aldrava?schema=public
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Producao

1. Troque `JWT_SECRET` e `ESP32_TOKEN`.
2. Use HTTPS real no Nginx ou em um load balancer externo.
3. Configure `FRONTEND_URL`, `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_SOCKET_URL` com o dominio publico.
4. Use TURN server em producao para redes moveis/NAT restritivo. O MVP usa STUN.
5. Restrinja o ESP32 a rede interna/VPN sempre que possivel.
6. Rotacione tokens e monitore `AccessLog`.

Para publicar em Vercel + Railway usando Supabase, veja [DEPLOY.md](./DEPLOY.md).

## WebRTC

O signaling passa pelo Socket.IO:

- `visitor:start-call`
- `resident:incoming-call`
- `resident:answer-call`
- `webrtc:offer`
- `webrtc:answer`
- `webrtc:ice-candidate`
- `call:end`

A midia trafega peer-to-peer. Para producao, adicione TURN em `NEXT_PUBLIC_STUN_URL`/config ICE.

## Seguranca implementada

- JWT para morador.
- Helmet, CORS e rate limit no backend.
- Zod para validação de payloads.
- Endpoint ESP32 protegido por Bearer Token.
- Logs estruturados com Pino.
- Headers de seguranca no Next/Nginx.

## PWA

O frontend inclui:

- `manifest.webmanifest`
- service worker com fallback offline
- estrutura de push notification
- layout responsivo mobile-first

## Comandos uteis

```bash
npm run lint
npm run typecheck
npm run build
npm run prisma:dev -w @aldrava/backend
npm run seed -w @aldrava/backend
docker compose down -v
```

## ESP32

Abra `iot/esp32/portaria_virtual_esp32.ino` na Arduino IDE, configure Wi-Fi/token/pino do rele e envie para o ESP32.

Endpoint:

```http
POST /open
Authorization: Bearer change_me_esp32_token
```

O rele e acionado por 1 segundo.
