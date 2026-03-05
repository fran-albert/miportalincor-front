export interface Program {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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
