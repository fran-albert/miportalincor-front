import { City } from "../City/City";

/**
 * DTO for updating a Doctor
 * All fields are optional - only send fields that need to be updated
 * Aligned with backend UpdateDoctorDto (PartialType of CreateDoctorDto)
 */
export interface UpdateDoctorDto {
  // User fields
  userName?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string | Date;
  email?: string;
  phoneNumber?: string;
  phoneNumber2?: string;
  photo?: string;
  gender?: string;
  maritalStatus?: string;
  bloodType?: string;
  rhFactor?: string;
  observations?: string;

  // Doctor-specific fields
  matricula?: string;
  firma?: string; // base64 image
  sello?: string; // base64 image
  specialities?: Array<{ id: number; name: string }>;
  healthInsurances?: Array<{ id: number; name: string }>;

  // Address
  address?: {
    id?: number;
    street?: string;
    number?: string;
    description?: string;
    phoneNumber?: string;
    city?: City;
  };
}
