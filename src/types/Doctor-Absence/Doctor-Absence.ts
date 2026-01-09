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

export const AbsenceLabels: Record<Absence, string> = {
    [Absence.VACATION]: 'Vacaciones',
    [Absence.LICENCE]: 'Licencia',
    [Absence.OTHER]: 'Otro',
};

export interface CreateDoctorAbsenceDto {
    doctorId: number;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    type: Absence;
}

export interface DoctorAbsenceResponseDto {
    id: number;
    doctorId: number;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    type: Absence;
    createdAt: string;
    updatedAt: string;
}
