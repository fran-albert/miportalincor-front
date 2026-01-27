import { apiTurnos } from "@/services/axiosConfig";
import { OverturnResponseDto } from "@/types/Overturn/Overturn";

export interface CreateGuestOverturnDto {
  doctorId: number;
  date: string;
  hour: string;
  guestDocumentNumber: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  guestEmail?: string;
  reason?: string;
}

// Backend DTO format
interface BackendGuestOverturnDto {
  doctorId: number;
  date: string;
  hour: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  reason?: string;
}

export const createGuestOverturn = async (
  dto: CreateGuestOverturnDto
): Promise<OverturnResponseDto> => {
  // Transform to backend format
  const backendDto: BackendGuestOverturnDto = {
    doctorId: dto.doctorId,
    date: dto.date,
    hour: dto.hour,
    documentNumber: dto.guestDocumentNumber,
    firstName: dto.guestFirstName,
    lastName: dto.guestLastName,
    phone: dto.guestPhone,
    // Only include email if it has a value
    ...(dto.guestEmail && dto.guestEmail.trim() !== '' && { email: dto.guestEmail }),
    ...(dto.reason && dto.reason.trim() !== '' && { reason: dto.reason }),
  };
  const { data } = await apiTurnos.post<OverturnResponseDto>('overturns/guest', backendDto);
  return data;
};
