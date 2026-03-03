import { z } from "zod";

export const ManualAttendanceSchema = z.object({
  enrollmentId: z.string().min(1, "Debe seleccionar una inscripción."),
  activityId: z
    .string({ required_error: "Debe seleccionar una actividad." })
    .min(1, "Debe seleccionar una actividad."),
  patientUserId: z.string().min(1, "Debe seleccionar un paciente."),
});

export type ManualAttendanceFormValues = z.infer<
  typeof ManualAttendanceSchema
>;
