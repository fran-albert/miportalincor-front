import { Base } from "../Base/Base";

export interface DoctorAvailability extends Base {
    doctorId: number;
    weekDay: WeekDays;
    startTime: string;
    endTime: string;
    slotDuration: number;
}

export interface CreateDoctorAvailabilityDto {
    doctorId: number;
    weekDay: WeekDays;
    startTime: string;
    endTime: string;
    slotDuration: number;
}

export enum WeekDays {
    LUNES = 1,
    MARTES = 2,
    MIERCOLES = 3,
    JUEVES = 4,
    VIERNES = 5,
    SABADO = 6,
    DOMINGO = 7,
}