import type { Server as SocketServer } from 'socket.io';
import type { VisitorCallPayload } from '@aldrava/shared';

let io: SocketServer | undefined;
let residentRoom = 'residents';

export function registerCallRealtime(socketServer: SocketServer, residentsRoomName: string) {
  io = socketServer;
  residentRoom = residentsRoomName;
}

export function publishVisitorCall(call: VisitorCallPayload) {
  const socket = io?.sockets.sockets.get(call.visitorSocketId);
  socket?.join(call.callId);
  socket?.emit('visitor:call-created', call);
  io?.to(residentRoom).emit('resident:incoming-call', call);
}
