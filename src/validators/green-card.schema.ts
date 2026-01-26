import { z } from "zod";

export const GreenCardItemSchema = z.object({
  schedule: z.string().min(1, "El horario es requerido"),
  medicationName: z.string().min(1, "El nombre del medicamento es requerido"),
  dosage: z.string().min(1, "La dosis es requerida"),
  quantity: z.string().optional(),
  notes: z.string().optional(),
  displayOrder: z.number().optional(),
});

export type GreenCardItemFormValues = z.infer<typeof GreenCardItemSchema>;
