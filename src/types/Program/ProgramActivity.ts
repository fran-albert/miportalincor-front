export interface ProgramActivity {
  id: string;
  programId: string;
  name: string;
  description?: string;
  assignedProfessionalUserId?: string;
  assignedProfessional?: {
    firstName: string;
    lastName: string;
  };
  qrToken: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateActivityDto {
  name: string;
  description?: string;
  assignedProfessionalUserId?: string;
}

export interface UpdateActivityDto {
  name?: string;
  description?: string;
  assignedProfessionalUserId?: string;
  isActive?: boolean;
}
