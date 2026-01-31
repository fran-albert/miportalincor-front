import { apiIncorHC } from "@/services/axiosConfig";
import {
  DoctorService,
  DoctorServicesSummary,
  ServiceType,
  UpdateDoctorServiceDto,
  CheckServiceResponse,
} from "@/types/Doctor-Services/DoctorServices";

/**
 * Check if a doctor has a specific service enabled
 */
export const checkDoctorService = async (
  doctorUserId: string,
  serviceType: ServiceType
): Promise<boolean> => {
  const { data } = await apiIncorHC.get<CheckServiceResponse>(
    `/doctor-services/check/${doctorUserId}/${serviceType}`
  );
  return data.enabled;
};

/**
 * Get all doctors with a specific service enabled
 */
export const getDoctorsWithService = async (
  serviceType: ServiceType
): Promise<DoctorService[]> => {
  const { data } = await apiIncorHC.get<DoctorService[]>(
    `/doctor-services/doctors-with/${serviceType}`
  );
  return data;
};

/**
 * Get summary of all doctor services for admin panel
 */
export const getAllDoctorServicesSummary = async (): Promise<
  DoctorServicesSummary[]
> => {
  const { data } = await apiIncorHC.get<DoctorServicesSummary[]>(
    "/doctor-services/summary"
  );
  return data;
};

/**
 * Get all services for a specific doctor
 */
export const getDoctorServices = async (
  doctorUserId: string
): Promise<DoctorService[]> => {
  const { data } = await apiIncorHC.get<DoctorService[]>(
    `/doctor-services/doctor/${doctorUserId}`
  );
  return data;
};

/**
 * Update a service for a doctor (Admin only)
 */
export const updateDoctorService = async (
  doctorUserId: string,
  serviceType: ServiceType,
  dto: UpdateDoctorServiceDto
): Promise<DoctorService> => {
  const { data } = await apiIncorHC.put<DoctorService>(
    `/doctor-services/doctor/${doctorUserId}/${serviceType}`,
    dto
  );
  return data;
};
