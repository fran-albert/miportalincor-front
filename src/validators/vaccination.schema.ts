import { z } from "zod";

export const VaccinationApplicationSchema = z.object({
  scheduleRuleId: z.string().min(1, "Selecciona una vacuna y dosis"),
  appliedDate: z.string().min(1, "La fecha de aplicacion es requerida"),
  observations: z.string().optional(),
});

export type VaccinationApplicationFormValues = z.infer<
  typeof VaccinationApplicationSchema
>;
