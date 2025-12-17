import { z } from "zod";

export const twoFactorSchema = z.object({
  code: z
    .string({ required_error: "El código es requerido" })
    .length(6, "El código debe tener 6 dígitos")
    .regex(/^\d{6}$/, "El código debe ser numérico"),
});

export type TwoFactorFormData = z.infer<typeof twoFactorSchema>;
