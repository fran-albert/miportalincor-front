import { z } from "zod";

export const CreateActivitySchema = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio." })
    .min(1, "El nombre no puede estar vacío."),
  description: z.string().optional(),
  assignedProfessionalUserId: z.string().optional(),
});

export const UpdateActivitySchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacío.").optional(),
  description: z.string().optional(),
  assignedProfessionalUserId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateActivityFormValues = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityFormValues = z.infer<typeof UpdateActivitySchema>;
