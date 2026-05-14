import type { Request } from 'express';

export function getRequestIp(req: Request) {
  return Array.isArray(req.ip) ? req.ip[0] : req.ip;
}

export function getRouteParam(req: Request, name: string) {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}
