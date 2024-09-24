import { z } from 'zod';

export const specialitySchema = z.object({
    id: z.number().optional(),
    name: z.string({
        message: 'El nombre de la especialidad es requerido',
    }),
});
