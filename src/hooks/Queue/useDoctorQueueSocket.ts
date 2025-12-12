import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  connectSocket,
  joinRoom,
  leaveRoom,
  QueueEvents,
  getDoctorRoom,
} from '@/services/socket.config';
import { doctorQueueKeys } from './useDoctorQueue';

interface PatientCheckedInEvent {
  id: number;
  displayNumber: string;
  patientName: string;
  patientDocument: string;
  doctorId: number;
  doctorName: string;
  scheduledTime: string;
  timestamp: string;
}

interface PatientCalledEvent {
  id: number;
  displayNumber: string;
  patientName: string;
  servicePoint: string;
  timestamp: string;
}

interface QueueUpdatedEvent {
  id: number;
  type: string;
  displayNumber?: string;
  timestamp: string;
}

interface UseDoctorQueueSocketOptions {
  doctorId: number | null;
  onPatientCheckedIn?: (data: PatientCheckedInEvent) => void;
  onPatientCalled?: (data: PatientCalledEvent) => void;
  onQueueUpdated?: (data: QueueUpdatedEvent) => void;
}

export function useDoctorQueueSocket(options: UseDoctorQueueSocketOptions) {
  const { doctorId, onPatientCheckedIn, onPatientCalled, onQueueUpdated } = options;
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // No conectar si no tenemos doctorId
    if (!doctorId) return;

    const socket = connectSocket();
    const room = getDoctorRoom(doctorId);

    const handleConnect = () => {
      setIsConnected(true);
      joinRoom(room);
      console.log(`[DoctorSocket] Joined room: ${room}`);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handlePatientCheckedIn = (data: PatientCheckedInEvent) => {
      console.log('[DoctorSocket] Paciente check-in:', data);
      // Invalidar queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: doctorQueueKeys.waiting });
      queryClient.invalidateQueries({ queryKey: doctorQueueKeys.stats });
      onPatientCheckedIn?.(data);
    };

    const handlePatientCalled = (data: PatientCalledEvent) => {
      console.log('[DoctorSocket] Paciente llamado:', data);
      queryClient.invalidateQueries({ queryKey: doctorQueueKeys.waiting });
      queryClient.invalidateQueries({ queryKey: doctorQueueKeys.stats });
      onPatientCalled?.(data);
    };

    const handleQueueUpdated = (data: QueueUpdatedEvent) => {
      console.log('[DoctorSocket] Cola actualizada:', data);
      queryClient.invalidateQueries({ queryKey: doctorQueueKeys.waiting });
      queryClient.invalidateQueries({ queryKey: doctorQueueKeys.stats });
      onQueueUpdated?.(data);
    };

    // Registrar listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(QueueEvents.PATIENT_CHECKED_IN, handlePatientCheckedIn);
    socket.on(QueueEvents.PATIENT_CALLED, handlePatientCalled);
    socket.on(QueueEvents.PATIENT_ATTENDING, handleQueueUpdated);
    socket.on(QueueEvents.PATIENT_COMPLETED, handleQueueUpdated);
    socket.on(QueueEvents.QUEUE_UPDATED, handleQueueUpdated);

    // Si ya está conectado, unirse a la sala
    if (socket.connected) {
      setIsConnected(true);
      joinRoom(room);
      console.log(`[DoctorSocket] Already connected, joined room: ${room}`);
    }

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(QueueEvents.PATIENT_CHECKED_IN, handlePatientCheckedIn);
      socket.off(QueueEvents.PATIENT_CALLED, handlePatientCalled);
      socket.off(QueueEvents.PATIENT_ATTENDING, handleQueueUpdated);
      socket.off(QueueEvents.PATIENT_COMPLETED, handleQueueUpdated);
      socket.off(QueueEvents.QUEUE_UPDATED, handleQueueUpdated);
      leaveRoom(room);
    };
  }, [doctorId, queryClient, onPatientCheckedIn, onPatientCalled, onQueueUpdated]);

  return {
    isConnected,
  };
}
