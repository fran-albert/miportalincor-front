import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentResponseDto } from "@/types/Appointment/Appointment";

export interface CreateGuestAppointmentDto {
  doctorId: number;
  date: string;
  hour: string;
  guestDocumentNumber: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  guestEmail?: string;
  consultationTypeId?: number;
  consultationTypeIds?: number[];
}

// Backend DTO format
interface BackendGuestDto {
  doctorId: number;
  date: string;
  hour: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  consultationTypeId?: number;
  consultationTypeIds?: number[];
}

export const createGuestAppointment = async (
  dto: CreateGuestAppointmentDto
): Promise<AppointmentResponseDto> => {
  // Transform to backend format
  const backendDto: BackendGuestDto = {
    doctorId: dto.doctorId,
    date: dto.date,
    hour: dto.hour,
    documentNumber: dto.guestDocumentNumber,
    firstName: dto.guestFirstName,
    lastName: dto.guestLastName,
    phone: dto.guestPhone,
    // Only include email if it has a value
    ...(dto.guestEmail && dto.guestEmail.trim() !== '' && { email: dto.guestEmail }),
    // Include consultationTypeId if provided
    ...(dto.consultationTypeId && { consultationTypeId: dto.consultationTypeId }),
    ...(dto.consultationTypeIds && dto.consultationTypeIds.length > 0 && {
      consultationTypeIds: dto.consultationTypeIds,
    }),
  };
  const { data } = await apiTurnos.post<AppointmentResponseDto>('appointments/internal-guest', backendDto);
  return data;
};
