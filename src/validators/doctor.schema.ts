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

/**
 * Schema for updating a Doctor
 * All fields are optional - only validate fields that are provided
 * Note: Only doctor-specific fields can be updated (not User fields)
 */
export const UpdateDoctorSchema = z.object({
  matricula: z.string().optional(),
  firma: z.string().optional(), // base64 image
  sello: z.string().optional(), // base64 image
  specialities: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ).optional(),
  healthInsurances: z.array(
    z.object({
      healthInsuranceId: z.number(),
      healthInsuranceName: z.string(),
    })
  ).optional(),
}).partial(); // Make all fields optional
