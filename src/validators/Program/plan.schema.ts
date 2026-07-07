import { z } from "zod";

const PlanActivityItemSchema = z
  .object({
    activityId: z
      .string({ required_error: "Debe seleccionar una actividad." })
      .min(1, "Debe seleccionar una actividad."),
    assignedProfessionalUserId: z.string().optional(),
    scheduleType: z
      .enum(["FREQUENCY", "DAYS_OF_WEEK", "SPECIFIC_DATES"])
      .optional(),
    frequencyCount: z.number().min(1, "Debe ser al menos 1.").optional(),
    frequencyPeriod: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    specificDates: z.array(z.string().min(1)).optional(),
    notes: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const scheduleType = value.scheduleType ?? "FREQUENCY";
    if (scheduleType === "FREQUENCY") {
      if (!value.frequencyCount || value.frequencyCount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["frequencyCount"],
          message: "La frecuencia es obligatoria.",
        });
      }
      if (!value.frequencyPeriod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["frequencyPeriod"],
          message: "Debe seleccionar un período.",
        });
      }
    }
    if (scheduleType === "DAYS_OF_WEEK" && !value.daysOfWeek?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["daysOfWeek"],
        message: "Seleccioná al menos un día.",
      });
    }
    if (scheduleType === "SPECIFIC_DATES" && !value.specificDates?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specificDates"],
        message: "Agregá al menos una fecha.",
      });
    }
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
