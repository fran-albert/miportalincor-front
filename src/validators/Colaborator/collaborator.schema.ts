import { z } from 'zod';

export const collaboratorSchema = z.object({
    firstName: z.string({ required_error: 'Campo Requerido.' }),
    lastName: z.string({ required_error: 'Campo Requerido.' }),
    userName: z.string({ required_error: 'Campo Requerido.' }),
    birthDate: z.string({ required_error: 'Campo Requerido.' }),
    phone: z.string({ required_error: 'Campo Requerido.' }),
    gender: z.string({ required_error: 'Campo Requerido.' }),
    address: z.object({
        street: z.string(),
        number: z.string(),
        description: z.string().optional(),
        phoneNumber: z.string().optional(),
        city: z.object({
            id: z.number(),
            name: z.string(),
            state: z.union([
                z.string(),
                z.object({
                    id: z.number(),
                    name: z.string(),
                    country: z.object({
                        id: z.number(),
                        name: z.string(),
                    }),
                }),
            ]),
        }),
    }),
    email: z.string({ required_error: 'Campo Requerido.' },),
    idCompany: z.string({ required_error: 'Campo Requerido.' },),
    healthInsuranceId: z.string({ required_error: 'Campo Requerido.' }),
    affiliationNumber: z.string().optional(),
    file: z.union([z.instanceof(File), z.string()]).optional(),
})