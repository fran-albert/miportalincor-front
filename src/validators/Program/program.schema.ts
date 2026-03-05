import { z } from "zod";

export const CreateProgramSchema = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio." })
    .min(1, "El nombre no puede estar vacío."),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const UpdateProgramSchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacío.").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateProgramFormValues = z.infer<typeof CreateProgramSchema>;
export type UpdateProgramFormValues = z.infer<typeof UpdateProgramSchema>;
