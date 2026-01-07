export interface DoctorNotificationSettings {
  id: number;
  doctorId: number;
  whatsappEnabled: boolean;
  confirmationEnabled: boolean;
  reminder24hEnabled: boolean;
  cancellationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDoctorNotificationSettingsDto {
  whatsappEnabled?: boolean;
  confirmationEnabled?: boolean;
  reminder24hEnabled?: boolean;
  cancellationEnabled?: boolean;
}

export interface CreateDoctorNotificationSettingsDto {
  doctorId: number;
  whatsappEnabled?: boolean;
  confirmationEnabled?: boolean;
  reminder24hEnabled?: boolean;
  cancellationEnabled?: boolean;
}
