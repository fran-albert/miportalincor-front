export interface DoctorNotificationSettings {
  id: number;
  doctorId: number;
  whatsappEnabled: boolean;
  confirmationEnabled: boolean;
  reminder24hEnabled: boolean;
  cancellationEnabled: boolean;
  dailyAgendaEnabled: boolean;
  dailyAgendaTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDoctorNotificationSettingsDto {
  whatsappEnabled?: boolean;
  confirmationEnabled?: boolean;
  reminder24hEnabled?: boolean;
  cancellationEnabled?: boolean;
  dailyAgendaEnabled?: boolean;
  dailyAgendaTime?: string;
}

export interface CreateDoctorNotificationSettingsDto {
  doctorId: number;
  whatsappEnabled?: boolean;
  confirmationEnabled?: boolean;
  reminder24hEnabled?: boolean;
  cancellationEnabled?: boolean;
  dailyAgendaEnabled?: boolean;
  dailyAgendaTime?: string;
}
