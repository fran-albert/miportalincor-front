export interface DoctorAbsence {
    doctorId: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    type: Absence;
}

export enum Absence {
    VACATION = 'VACATION',
    LICENCE = 'LICENCE',
    OTHER = 'OTHER',
}

export interface CreateDoctorAbsenceDto {
    doctorId: number;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    type: Absence;
}
