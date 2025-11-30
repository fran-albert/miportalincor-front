import { Country } from "../Country/Country";

/**
 * DTO for updating a Patient
 * All fields are optional - only send fields that need to be updated
 * Aligned with backend UpdatePatientDto (PartialType of PatientDto)
 */
export interface UpdatePatientDto {
  userName?: string; // DNI
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string; // ISO date string (YYYY-MM-DD)
  photo?: string | null;
  address?: {
    id?: number;
    street?: string;
    number?: string;
    description?: string;
    phoneNumber?: string;
    city?: {
      id: number;
      name: string;
      state?: {
        id: number;
        name: string;
        country?: Country;
      };
    };
  };
  healthPlans?: Array<{ id: number; name: string }>;
  registeredById?: string;
  cuil?: string;
  cuit?: string;
  phoneNumber2?: string;
  bloodType?: string;
  rhFactor?: string;
  maritalStatus?: string;
  affiliationNumber?: string;
  gender?: string;
  observations?: string;
  died?: string;
}
