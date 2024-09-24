import { z } from 'zod';

export const healthInsuranceSchema = z.object({
    id: z.number().optional(),
    name: z.string({
        message: 'El nombre de la obra social es requerido',
    }),
});
