import { z } from "zod";

export const CreateDoctorScheduleExceptionSchema = z
  .object({
    doctorId: z
      .number({
        required_error: "Debe seleccionar un médico",
      })
      .min(1, "Debe seleccionar un médico"),
    date: z.string().min(1, "Debe seleccionar una fecha"),
    startTime: z
      .string({
        required_error: "Debe ingresar hora de inicio",
      })
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido (HH:mm)"),
    endTime: z
      .string({
        required_error: "Debe ingresar hora de fin",
      })
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido (HH:mm)"),
    slotDuration: z.number().min(5).max(120).default(30),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "La hora de inicio debe ser menor a la hora de fin",
    path: ["endTime"],
  });

export type CreateDoctorScheduleExceptionFormData = z.infer<
  typeof CreateDoctorScheduleExceptionSchema
>;
