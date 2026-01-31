export enum ServiceType {
  GREEN_CARD = 'GREEN_CARD',
  WHATSAPP_APPOINTMENTS = 'WHATSAPP_APPOINTMENTS',
}

export const ServiceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.GREEN_CARD]: 'Cartón Verde',
  [ServiceType.WHATSAPP_APPOINTMENTS]: 'WhatsApp Turnos',
};

export interface DoctorService {
  id: string;
  doctorUserId: string;
  serviceType: ServiceType;
  enabled: boolean;
  enabledAt?: string;
  disabledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceStatus {
  enabled: boolean;
  enabledAt?: string;
}

export interface DoctorServicesSummary {
  doctorUserId: string;
  doctorName?: string;
  services: {
    [key in ServiceType]?: ServiceStatus;
  };
}

export interface UpdateDoctorServiceDto {
  enabled: boolean;
  notes?: string;
}

export interface CheckServiceResponse {
  enabled: boolean;
}
