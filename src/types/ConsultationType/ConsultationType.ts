/**
 * Tipo de consulta médica (Consulta, Ergometría, Ecocardiograma, etc.)
 */
export interface ConsultationType {
  id: number;
  name: string;
  description?: string;
  scope?: "global" | "specialty" | "doctor";
  specialityId?: number | null;
  createdByDoctorId?: number | null;
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
  scope?: "global" | "specialty" | "doctor";
  specialityId?: number | null;
  createdByDoctorId?: number | null;
  defaultDurationMinutes: number;
  color?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export type UpdateConsultationTypeDto = Partial<
  Omit<CreateConsultationTypeDto, "defaultDurationMinutes">
> & {
  defaultDurationMinutes?: number;
};
