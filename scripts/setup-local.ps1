Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm install
npm run prisma:generate -w @aldrava/backend
npm run prisma:dev -w @aldrava/backend
npm run seed -w @aldrava/backend
