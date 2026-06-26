export interface PrescriptionCenter {
  id: string;
  name: string;
  isActive: boolean;
}

export interface PrescriptionCenterOperator {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  assignedAt: string;
  isActive: boolean;
}
