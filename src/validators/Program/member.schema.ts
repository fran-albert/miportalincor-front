import { z } from "zod";

export const AddMemberSchema = z.object({
  userId: z
    .string({ required_error: "Debe seleccionar un usuario." })
    .min(1, "Debe seleccionar un usuario."),
  role: z.enum(["PROFESSIONAL", "COORDINATOR", "OTHER"], {
    required_error: "Debe seleccionar un rol.",
  }),
});

export type AddMemberFormValues = z.infer<typeof AddMemberSchema>;
