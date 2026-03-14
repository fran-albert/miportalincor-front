/**
 * Tipo de consulta médica (Consulta, Ergometría, Ecocardiograma, etc.)
 */
export interface ConsultationType {
  id: number;
  name: string;
  description?: string;
  defaultDurationMinutes: number;
  color?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ConsultationTypeResponseDto = ConsultationType;

export interface CreateConsultationTypeDto {
  name: string;
  description?: string;
  defaultDurationMinutes: number;
  color?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export type UpdateConsultationTypeDto = Partial<CreateConsultationTypeDto>;
