import { apiTurnos } from '@/services/axiosConfig';
import type { QueueEntry, QueueStats, CallPatientDto, CallSpecificPatientDto, ChangeQueueStatusDto } from '@/types/Queue';

// GET - Obtener cola de espera
export const getWaitingQueue = async (): Promise<QueueEntry[]> => {
  const response = await apiTurnos.get('/queue/waiting');
  return response.data;
};

// GET - Obtener pacientes activos (llamados/atendiendo)
// Filtra de /queue/today los que tienen status CALLED o ATTENDING
export const getActiveQueue = async (): Promise<QueueEntry[]> => {
  const response = await apiTurnos.get('/queue/today');
  const allToday: QueueEntry[] = response.data;
  return allToday.filter(
    (entry) => entry.status === 'CALLED' || entry.status === 'ATTENDING'
  );
};

// GET - Obtener estadisticas
export const getQueueStats = async (): Promise<QueueStats> => {
  const response = await apiTurnos.get('/queue/stats');
  return response.data;
};

// GET - Obtener cola para display (TV)
export const getQueueDisplay = async (limit: number = 5): Promise<QueueEntry[]> => {
  const response = await apiTurnos.get('/queue/display', { params: { limit } });
  return response.data;
};

// GET - Obtener entrada por ID
export const getQueueEntryById = async (id: number): Promise<QueueEntry> => {
  const response = await apiTurnos.get(`/queue/${id}`);
  return response.data;
};

// POST - Llamar al siguiente paciente
export const callNextPatient = async (dto: CallPatientDto): Promise<QueueEntry> => {
  const response = await apiTurnos.post('/queue/call-next', dto);
  return response.data;
};

// POST - Llamar a un paciente especifico
// Endpoint: POST /queue/:id/call
export const callSpecificPatient = async (dto: CallSpecificPatientDto): Promise<QueueEntry> => {
  const { queueEntryId, servicePoint } = dto;
  const response = await apiTurnos.post(`/queue/${queueEntryId}/call`, { servicePoint });
  return response.data;
};

// POST - Re-llamar a un paciente (vuelve a llamar al mismo paciente)
export const recallPatient = async (id: number): Promise<QueueEntry> => {
  const response = await apiTurnos.post(`/queue/${id}/recall`);
  return response.data;
};

// PATCH - Marcar como atendiendo
export const markAsAttending = async (id: number): Promise<QueueEntry> => {
  const response = await apiTurnos.patch(`/queue/${id}/attending`);
  return response.data;
};

// PATCH - Marcar como completado
export const markAsCompleted = async (id: number): Promise<QueueEntry> => {
  const response = await apiTurnos.patch(`/queue/${id}/completed`);
  return response.data;
};

// PATCH - Marcar como no-show
export const markAsNoShow = async (id: number): Promise<QueueEntry> => {
  const response = await apiTurnos.patch(`/queue/${id}/no-show`);
  return response.data;
};

// PATCH - Cambiar estado
export const changeQueueStatus = async (id: number, dto: ChangeQueueStatusDto): Promise<QueueEntry> => {
  const response = await apiTurnos.patch(`/queue/${id}/status`, dto);
  return response.data;
};
