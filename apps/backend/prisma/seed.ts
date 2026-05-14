import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12);
  const tokenHash = await bcrypt.hash(process.env.ESP32_TOKEN ?? 'dev-esp32-token', 12);

  await prisma.user.upsert({
    where: { email: 'morador@example.com' },
    update: {},
    create: {
      email: 'morador@example.com',
      name: 'Morador Demo',
      passwordHash,
      role: 'ADMIN',
    },
  });

  await prisma.device.upsert({
    where: { id: 'dev-gate-controller' },
    update: {},
    create: {
      id: 'dev-gate-controller',
      name: 'ESP32 Portao Principal',
      tokenHash,
      baseUrl: process.env.ESP32_BASE_URL ?? 'http://esp32.local',
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
