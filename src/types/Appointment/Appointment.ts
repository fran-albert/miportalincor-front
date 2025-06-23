import { Doctor } from "../Doctor/Doctor";
import { Notification } from "../Notifications/Notifications";
import { Patient } from "../Patient/Patient";

export interface Appointment {
    doctorId: number;
    patientId: number;
    date: string;
    hour: string;
    status: AppointmentStatus;
    notifications: Notification[];
}

export interface CreateAppointmentDto {
    doctorId: number;
    patientId: number;
    date: string;
    hour: string;
}

export enum AppointmentStatus {
    PENDIENTE = 'PENDING',
    CONFIRMADO = 'CONFIRMED',
    CANCELADO = 'CANCELED',
    COMPLETADO = 'COMPLETED',
}

export interface AppointmentWithPatientDto {
    id: number;
    doctorId: number;
    date: string;
    hour: string;
    status: AppointmentStatus;
    notifications: Notification[];
    patient: {
        firstName: string;
        lastName: string;
        userId: number;
    } | null;
}

export interface AppointmentResponseDto {
    id: number;
    date: string;
    hour: string;
    status: AppointmentStatus;
    notifications?: Notification[];

    doctor: Partial<Doctor> | null;
    patient: Partial<Patient> | null;
}

export interface AppointmentDetailedDto {
    id: number;
    date: string;
    hour: string;
    status: AppointmentStatus;
    doctor: Partial<Doctor> | null;
    patient: Partial<Patient> | null;
}
