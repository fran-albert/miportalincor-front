import { z } from "zod";

export const evolutionSchema = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  doctor: z.string().optional(),
  doctorId: z.union([z.string(), z.number()]).optional(),
  consultationReason: z.string().min(1, "El motivo de consulta es requerido"),
  currentIllness: z.string().min(1, "La enfermedad actual es requerida"),
  companyNote: z.string().optional(),
  sendEmail: z.boolean().default(false),
  companyEmail: z.string().optional(),
}).refine((data) => {
  if (data.sendEmail) {
    return data.companyEmail && z.string().email().safeParse(data.companyEmail).success;
  }
  return true;
}, {
  message: "Email es requerido cuando se selecciona enviar email",
  path: ["companyEmail"],
}).refine((data) => {
  if (data.sendEmail) {
    return data.companyNote && data.companyNote.trim().length > 0;
  }
  return true;
}, {
  message: "La nota es requerida cuando se selecciona enviar email",
  path: ["companyNote"],
});

export type EvolutionFormData = z.infer<typeof evolutionSchema>;