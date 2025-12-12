import { io, Socket } from 'socket.io-client';
import { environment } from '@/config/environment';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // Remover /api del final de la URL si existe
    const baseUrl = environment.API_TURNOS_URL.replace('/api', '');

    console.log('[Socket] Connecting to:', `${baseUrl}/queue`);

    socket = io(`${baseUrl}/queue`, {
      transports: ['polling', 'websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      path: '/socket.io/',
    });

    socket.on('connect', () => {
      console.log('[Socket] Conectado al servidor Queue');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Error de conexión:', error.message);
    });
  }

  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const joinRoom = (room: string): void => {
  const s = getSocket();
  s.emit('join:room', room);
};

export const leaveRoom = (room: string): void => {
  const s = getSocket();
  s.emit('leave:room', room);
};

// Eventos que puede recibir el cliente
export enum QueueEvents {
  PATIENT_CHECKED_IN = 'patient:checked_in',
  PATIENT_CALLED = 'patient:called',
  PATIENT_ATTENDING = 'patient:attending',
  PATIENT_COMPLETED = 'patient:completed',
  PATIENT_NO_SHOW = 'patient:no_show',
  QUEUE_UPDATED = 'queue:updated',
  STATS_UPDATED = 'stats:updated',
}

// Helper para crear el nombre del room del doctor
export const getDoctorRoom = (doctorId: number): string => {
  return `room:doctor:${doctorId}`;
};
