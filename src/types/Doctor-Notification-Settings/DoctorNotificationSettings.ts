export interface DoctorNotificationSettings {
  id: number;
  doctorId: number;
  whatsappEnabled: boolean;
  confirmationEnabled: boolean;
  reminder24hEnabled: boolean;
  cancellationEnabled: boolean;
  dailyAgendaEnabled: boolean;
  dailyAgendaTime: string;
  previousDayDailyAgendaEnabled: boolean;
  previousDayDailyAgendaTime: string;
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
  previousDayDailyAgendaEnabled?: boolean;
  previousDayDailyAgendaTime?: string;
}

export interface CreateDoctorNotificationSettingsDto {
  doctorId: number;
  whatsappEnabled?: boolean;
  confirmationEnabled?: boolean;
  reminder24hEnabled?: boolean;
  cancellationEnabled?: boolean;
  dailyAgendaEnabled?: boolean;
  dailyAgendaTime?: string;
  previousDayDailyAgendaEnabled?: boolean;
  previousDayDailyAgendaTime?: string;
}
