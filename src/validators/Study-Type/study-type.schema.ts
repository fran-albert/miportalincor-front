import { z } from 'zod';

export const studyTypeSchema = z.object({
    id: z.number().optional(),
    name: z.string({
        message: 'El nombre del tipo de estudio es requerido',
    }),
});
