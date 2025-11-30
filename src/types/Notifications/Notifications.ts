import { Appointment } from "../Appointment/Appointment";

export interface Notification {
    appointment: Appointment[],
    type: NotificationType;
    sentAt?: Date;
    status: NotificationStatus;
    message?: string;
}

export enum NotificationStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED',
}

export enum NotificationType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
}