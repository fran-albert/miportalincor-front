import { z } from "zod";

export const SecretarySchema = z.object({
  firstName: z
    .string({ required_error: "Este campo es obligatorio." })
    .max(255),
  lastName: z.string({ required_error: "Este campo es obligatorio." }).max(255),
  userName: z.string({ required_error: "Este campo es obligatorio." }), // DNI
  email: z.string().email({ message: "Debe ingresar un correo electrónico válido." }).optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  phoneNumber2: z.string().optional(),
  photo: z.string().optional(),
  birthDate: z.union([
    z.string({ required_error: "Este campo es obligatorio." }),
    z.date({ required_error: "Este campo es obligatorio." }),
  ]),
  address: z.object({
    id: z.number().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    description: z.string().optional(),
    phoneNumber: z.string().optional(),
    city: z.object({
      id: z.number({ required_error: "Debe seleccionar una ciudad." }),
      name: z.string({ required_error: "Debe seleccionar una ciudad." }),
      state: z.union([
        z.string({ required_error: "Debe seleccionar una provincia." }),
        z.object({
          id: z.number({ required_error: "Debe seleccionar una provincia." }),
          name: z.string({ required_error: "Debe seleccionar una provincia." }),
          country: z.object({
            id: z.number(),
            name: z.string(),
          }),
        }),
      ]),
    }, { required_error: "Debe seleccionar una ciudad." }),
  }).required({ city: true }),
  rhFactor: z.string().optional(),
  maritalStatus: z.string().optional(),
  bloodType: z.string().optional(),
  gender: z.string({ required_error: "Este campo es obligatorio." }),
});

/**
 * Schema for updating a Secretary.
 * Derives from SecretarySchema so all form fields (userName, address.description,
 * state union, etc.) are present. Adds observations which the form uses.
 * .partial() makes all fields optional for partial updates.
 */
export const UpdateSecretarySchema = SecretarySchema.extend({
  observations: z.string().optional(),
}).partial();
