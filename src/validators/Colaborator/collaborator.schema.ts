import { z } from "zod";

export const collaboratorSchema = z.object({
  firstName: z
    .string({ required_error: "Campo Requerido." })
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres"),
  lastName: z
    .string({ required_error: "Campo Requerido." })
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres"),
  positionJob: z
    .string({ required_error: "Campo Requerido." })
    .min(2, "Mínimo 2 caracteres"),
  userName: z
    .string({ required_error: "Campo Requerido." })
    .regex(/^\d{7,8}$/, "Debe ser un DNI válido de 7 u 8 dígitos"),
  birthDate: z
    .string({ required_error: "Campo Requerido." })
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Formato de fecha inválido"),
  phone: z
    .string({ required_error: "Campo Requerido." }),
  gender: z.string({ required_error: "Campo Requerido." }),
  email: z
    .string({ required_error: "Campo Requerido." })
    .email("Debe ser un correo válido"),
  idCompany: z
    .string({ required_error: "Campo Requerido." })
    .min(1, "Campo Requerido."),
  file: z.union([z.instanceof(File), z.string()]).optional(),
  address: z.object({
    id: z.number().optional(),
    street: z.string().max(100, "Máximo 100 caracteres").optional(),
    number: z.string().regex(/^\d+$/, "Solo números").optional(),
    description: z.string().max(100, "Máximo 100 caracteres").optional(),
    phoneNumber: z
      .string()
      .optional(),
    city: z.object({
      id: z.number({ required_error: "Ciudad requerida" }),
      name: z.string({ required_error: "Nombre de ciudad requerido" }),
      state: z.object({
        id: z.number({ required_error: "Provincia requerida" }),
        name: z.string({ required_error: "Nombre de provincia requerido" }),
        country: z
          .object({
            id: z.number(),
            name: z.string(),
          })
          .optional(),
      }),
    }),
  }),
});
