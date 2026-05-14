CREATE TYPE "UserRole" AS ENUM ('RESIDENT', 'ADMIN');
CREATE TYPE "DeviceType" AS ENUM ('GATE_CONTROLLER', 'CAMERA');
CREATE TYPE "CallStatus" AS ENUM ('RINGING', 'ANSWERED', 'REJECTED', 'ENDED', 'MISSED');
CREATE TYPE "AccessAction" AS ENUM ('CALL_STARTED', 'CALL_ANSWERED', 'CALL_REJECTED', 'CALL_ENDED', 'GATE_OPENED', 'GATE_DENIED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'RESIDENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Device" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "DeviceType" NOT NULL DEFAULT 'GATE_CONTROLLER',
  "tokenHash" TEXT NOT NULL,
  "baseUrl" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Call" (
  "id" TEXT NOT NULL,
  "visitorName" TEXT,
  "visitorSocketId" TEXT,
  "residentId" TEXT,
  "status" "CallStatus" NOT NULL DEFAULT 'RINGING',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "answeredAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccessLog" (
  "id" TEXT NOT NULL,
  "action" "AccessAction" NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "userId" TEXT,
  "callId" TEXT,
  "deviceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Device_type_enabled_idx" ON "Device"("type", "enabled");
CREATE INDEX "Call_status_createdAt_idx" ON "Call"("status", "createdAt");
CREATE INDEX "Call_residentId_createdAt_idx" ON "Call"("residentId", "createdAt");
CREATE INDEX "AccessLog_action_createdAt_idx" ON "AccessLog"("action", "createdAt");
CREATE INDEX "AccessLog_callId_idx" ON "AccessLog"("callId");
CREATE INDEX "AccessLog_userId_idx" ON "AccessLog"("userId");

ALTER TABLE "Call" ADD CONSTRAINT "Call_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
