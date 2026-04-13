import { z } from "zod";

const PlanActivityItemSchema = z.object({
  activityId: z
    .string({ required_error: "Debe seleccionar una actividad." })
    .min(1, "Debe seleccionar una actividad."),
  assignedProfessionalUserId: z.string().optional(),
  frequencyCount: z
    .number({ required_error: "La frecuencia es obligatoria." })
    .min(1, "Debe ser al menos 1."),
  frequencyPeriod: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"], {
    required_error: "Debe seleccionar un período.",
  }),
  notes: z.string().optional(),
});

export const CreatePlanVersionSchema = z.object({
  validFrom: z
    .string({ required_error: "La fecha de inicio es obligatoria." })
    .min(1, "La fecha de inicio es obligatoria."),
  activities: z
    .array(PlanActivityItemSchema)
    .min(1, "Debe agregar al menos una actividad."),
});

export type CreatePlanVersionFormValues = z.infer<
  typeof CreatePlanVersionSchema
>;
