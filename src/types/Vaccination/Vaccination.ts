export type VaccinationCardStatus =
  | "applied"
  | "pending"
  | "overdue"
  | "upcoming";

export interface VaccinationVaccine {
  id: string;
  code: string;
  name: string;
  description?: string;
  source?: string;
  active: boolean;
}

export interface VaccinationScheduleRule {
  id: string;
  vaccineId: string;
  vaccine?: VaccinationVaccine;
  doseLabel: string;
  recommendedAgeMonths?: number | null;
  overdueAgeMonths?: number | null;
  sortOrder: number;
  notes?: string;
  active: boolean;
}

export interface VaccinationDoctorInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export interface VaccinationPatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  birthDate: string;
}

export interface VaccinationApplication {
  id: string;
  patientUserId: string;
  vaccineId: string;
  scheduleRuleId: string;
  doseLabel: string;
  appliedDate: string;
  observations?: string;
  doctorUserId: string;
  doctor?: VaccinationDoctorInfo;
  vaccine?: VaccinationVaccine;
  canEdit: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface VaccinationCardItem {
  scheduleRuleId: string;
  vaccineId: string;
  vaccine: VaccinationVaccine;
  doseLabel: string;
  recommendedAgeMonths?: number | null;
  overdueAgeMonths?: number | null;
  recommendedDate?: string;
  overdueDate?: string;
  status: VaccinationCardStatus;
  notes?: string;
  application?: VaccinationApplication;
}

export interface VaccinationCardCounts {
  applied: number;
  pending: number;
  overdue: number;
  upcoming: number;
}

export interface VaccinationCard {
  patientUserId: string;
  patient?: VaccinationPatientInfo;
  generatedAt: string;
  counts: VaccinationCardCounts;
  items: VaccinationCardItem[];
  applications: VaccinationApplication[];
  canAddApplications: boolean;
}

export interface VaccinationCatalog {
  vaccines: VaccinationVaccine[];
  scheduleRules: VaccinationScheduleRule[];
}

export interface CreateVaccinationApplicationDto {
  scheduleRuleId: string;
  appliedDate: string;
  observations?: string;
}

export interface UpdateVaccinationApplicationDto {
  scheduleRuleId?: string;
  appliedDate?: string;
  observations?: string;
}
