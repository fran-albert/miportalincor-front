export interface SignupPrefill {
  dni: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
}

export interface SignupHealthPlan {
  id: number;
  name: string;
}

export interface SignupHealthInsurance {
  id: number;
  name: string;
  /** false solo para PARTICULAR (no tiene número de afiliado). */
  requiresAffiliationNumber: boolean;
  plans: SignupHealthPlan[];
}

export interface CompleteSignupPayload {
  token?: string;
  dni: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  birthDate: string;
  healthPlanId: number;
  affiliationNumber?: string;
  address: {
    cityId: number;
    street: string;
    number: string;
    description?: string;
  };
  password: string;
}

export interface SignupSession {
  token: string;
  expiresIn: number;
}

export const SIGNUP_ERROR_CODES = {
  TOKEN_INVALID: "SIGNUP_TOKEN_INVALID",
  TOKEN_DNI_MISMATCH: "SIGNUP_TOKEN_DNI_MISMATCH",
  DNI_HAS_ACCOUNT: "DNI_HAS_ACCOUNT",
  NEEDS_RECEPTION: "SIGNUP_NEEDS_RECEPTION",
} as const;
