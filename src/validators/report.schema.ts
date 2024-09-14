import { z } from 'zod';

export const ReportSchema = z.object({
    priority: z.string({
        required_error: "Este campo es obligatorio."
    }),
    module: z.string({
        required_error: "Este campo es obligatorio."
    }),
    description: z.string({
        required_error: "Este campo es obligatorio."
    }),
});

