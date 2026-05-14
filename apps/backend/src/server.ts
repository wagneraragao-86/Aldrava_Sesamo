import { createServer } from 'node:http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { createApp } from './http/app.js';
import { createRealtimeServer } from './realtime/signaling.js';

const app = createApp();
const server = createServer(app);
createRealtimeServer(server);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'backend listening');
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
