import { z } from "zod";

export const EnrollPatientSchema = z.object({
  patientUserId: z
    .string({ required_error: "Debe seleccionar un paciente." })
    .min(1, "Debe seleccionar un paciente."),
});

export const UpdateEnrollmentStatusSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "SUSPENDED", "CANCELLED"], {
    required_error: "Debe seleccionar un estado.",
  }),
});

export type EnrollPatientFormValues = z.infer<typeof EnrollPatientSchema>;
export type UpdateEnrollmentStatusFormValues = z.infer<
  typeof UpdateEnrollmentStatusSchema
>;
