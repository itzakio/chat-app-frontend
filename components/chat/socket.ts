import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (token?: string) => {
  if (!socket && token) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    // Strip trailing /api if it exists to get the base Socket.IO server URL
    const socketUrl = apiUrl.replace(/\/api\/?$/, '');
    
    socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};