import { z } from "zod";
import { UserSchema } from "./user.schema";

export const DoctorSchema = UserSchema.extend({
  email: z
    .string({ required_error: "Este campo es obligatorio." })
    .email({ message: "Debe ingresar un correo electrónico válido." }),
  matricula: z
    .string({ required_error: "Este campo es obligatorio." })
    .min(1, "La matrícula no puede estar vacía."),
  specialities: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .default([]),
  healthInsurances: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .default([]),
});
