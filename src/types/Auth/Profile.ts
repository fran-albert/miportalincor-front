export interface AuthProfile {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  phoneNumber?: string;
  photo?: string;
  twoFactorEnabled?: boolean;
}

export interface UpdateTwoFactorPreferenceDto {
  enabled: boolean;
}
