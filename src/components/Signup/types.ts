export interface SignupFormData {
  dni: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  /** DD/MM/AAAA, como lo escribe el paciente. */
  birthDate: string;
  healthInsuranceId: number | null;
  healthInsuranceName: string;
  requiresAffiliationNumber: boolean;
  healthPlanId: number | null;
  healthPlanName: string;
  affiliationNumber: string;
  stateId: number | null;
  stateName: string;
  cityId: number | null;
  cityName: string;
  street: string;
  number: string;
  description: string;
  password: string;
  confirmPassword: string;
}

export const EMPTY_SIGNUP_FORM: SignupFormData = {
  dni: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  birthDate: "",
  healthInsuranceId: null,
  healthInsuranceName: "",
  requiresAffiliationNumber: true,
  healthPlanId: null,
  healthPlanName: "",
  affiliationNumber: "",
  stateId: null,
  stateName: "",
  cityId: null,
  cityName: "",
  street: "",
  number: "",
  description: "",
  password: "",
  confirmPassword: "",
};

export type DataStep = "dni" | "personal" | "health" | "address" | "password";
export type SignupScreen = DataStep | "summary" | "has-account";

export const DATA_STEP_ORDER: DataStep[] = [
  "dni",
  "personal",
  "health",
  "address",
  "password",
];

export interface StepProps {
  data: SignupFormData;
  onChange: (patch: Partial<SignupFormData>) => void;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
}
