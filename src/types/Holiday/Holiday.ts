export enum HolidayType {
  INAMOVIBLE = 'inamovible',
  TRASLADABLE = 'trasladable',
  PUENTE = 'puente',
}

export enum HolidaySource {
  MANUAL = 'manual',
  API_ARGENTINA = 'api_argentina',
}

export interface Holiday {
  id: number;
  date: string;
  description?: string;
  type?: HolidayType;
  source?: HolidaySource;
}

export interface CreateHolidayDto {
  date: string;
  description?: string;
  type?: HolidayType;
}

export interface SyncHolidaysResult {
  year: number;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  message: string;
}
