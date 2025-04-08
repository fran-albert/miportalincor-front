import { z } from 'zod';

export const companySchema = z.object({
    name: z.string({
        required_error: 'Este campo es requerido.',
    }),
    address: z.object({
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
    taxId: z.string({
        required_error: 'Este campo es requerido.',
    }),
    email: z.string({
        required_error: 'Este campo es requerido.',
    }),
    phone: z.string({
        required_error: 'Este campo es requerido.',
    }),
});
