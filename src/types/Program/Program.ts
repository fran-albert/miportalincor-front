export interface Program {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  discountPercent: number;
  discountBasisPoints: number;
  /** El programa lleva ficha clínica de ingreso y mide una métrica seriada. */
  clinicalIntakeEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramPricing {
  discountPercent: number;
  discountBasisPoints: number;
}

export interface UpdateProgramPricingDto {
  discountPercent: number;
}

export interface CreateProgramDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProgramDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}
