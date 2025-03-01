import { z } from 'zod';

export const collaboratorSchema = z.object({
    firstName: z.string({ required_error: 'Campo Requerido.' }),
    lastName: z.string({ required_error: 'Campo Requerido.' }),
    userName: z.string({ required_error: 'Campo Requerido.' }),
    birthDate: z.string({ required_error: 'Campo Requerido.' }),
    phone: z.string({ required_error: 'Campo Requerido.' }),
    gender: z.string({ required_error: 'Campo Requerido.' }),
    address: z.string({ required_error: 'Campo Requerido.', }),
    email: z.string({ required_error: 'Campo Requerido.' },),
    idCompany: z.string({ required_error: 'Campo Requerido.' },),
    file: z.union([z.instanceof(File), z.string()]).optional(),
})