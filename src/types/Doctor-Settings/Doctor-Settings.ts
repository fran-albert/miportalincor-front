export interface DoctorSettings {
  id: string;
  doctorUserId: string;
  acceptsPrescriptionRequests: boolean;
  maxPendingPrescriptions: number;
  prescriptionRequestNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDoctorSettingsDto {
  acceptsPrescriptionRequests?: boolean;
  maxPendingPrescriptions?: number;
  prescriptionRequestNotes?: string;
}
