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
  /**
   * Subtipo de ecografía: lo declara el ABM (columna del catálogo) y es lo
   * que hace que el tipo aparezca en el selector de recepción y viaje a la
   * worklist del ecógrafo. Antes era una lista de IDs en una env del backend.
   */
  isEcoSubtype: boolean;
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
  isEcoSubtype?: boolean;
}

export type UpdateConsultationTypeDto = Partial<
  Omit<CreateConsultationTypeDto, "defaultDurationMinutes">
> & {
  defaultDurationMinutes?: number;
};
