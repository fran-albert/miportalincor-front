export interface Appointment {
    doctorId: number;
    patientId: number;
    date: string;
    hour: string;
    status: string;
    notifications: Notification[];
}

export interface CreateAppointmentDto {
    doctorId: number;
    patientId: number;
    date: string;
    hour: string;
}