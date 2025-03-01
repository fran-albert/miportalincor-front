import { z } from 'zod';

export const companySchema = z.object({
    name: z.string({
        required_error: 'Este campo es requerido.',
    }),
    address: z.string({
        required_error: 'Este campo es requerido.',
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
