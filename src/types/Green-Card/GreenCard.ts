export interface DoctorInfo {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  specialities?: string[];
}

export interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
}

// Each medication item now tracks which doctor added it
export interface GreenCardItem {
  id: string;
  doctorUserId: string;      // Which doctor added this medication
  doctor?: DoctorInfo;       // Doctor info
  schedule: string;          // "Ayuno", "08:00", "12:00", "20:00"
  medicationName: string;    // "Losartan 50mg"
  dosage: string;            // "1", "1/2", "2 comprimidos"
  quantity?: string;         // "2", "3 cajas" - cantidad de envases a recetar
  notes?: string;
  isActive: boolean;
  canEdit: boolean;          // Only the doctor who added can edit
  hasPendingPrescription: boolean; // If there's a pending/in-progress prescription request
  displayOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// One card per patient (no longer per doctor-patient pair)
export interface GreenCard {
  id: string;
  patientUserId: string;
  patient?: PatientInfo;
  items: GreenCardItem[];
  activeItemsCount: number;
  totalItemsCount: number;
  canAddItems: boolean;      // Can current doctor add items?
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateGreenCardDto {
  patientUserId: string;
}

export interface CreateGreenCardItemDto {
  schedule: string;
  medicationName: string;
  dosage: string;
  quantity?: string;
  notes?: string;
  displayOrder?: number;
}

export interface UpdateGreenCardItemDto {
  schedule?: string;
  medicationName?: string;
  dosage?: string;
  quantity?: string;
  notes?: string;
  displayOrder?: number;
}

export interface GreenCardSummary {
  hasMedications: boolean;
  totalMedications: number;
  activeMedications: number;
  doctors: {
    id: string;
    name: string;
    speciality?: string;
    medicationsCount: number;
  }[];
}

export interface RequestPrescriptionDto {
  cardId: string;
  itemId: string;
  doctorUserId?: string;  // Optional: request to a different doctor
}
