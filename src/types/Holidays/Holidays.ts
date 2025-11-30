export interface Holidays {
    date: string;
    description: string;
}

export interface CreateHolidayDto {
    date: string;
    description?: string;
}
