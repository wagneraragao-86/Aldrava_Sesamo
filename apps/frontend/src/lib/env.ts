export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001',
  stunUrl: process.env.NEXT_PUBLIC_STUN_URL ?? 'stun:stun.l.google.com:19302',
  visitorUrl: process.env.NEXT_PUBLIC_VISITOR_URL,
};
