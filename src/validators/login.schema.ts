import { z } from 'zod';

export const loginSchema = z.object({
    userName: z.union([
        z.string({
            required_error: 'Email o DNI es requerido.',
        }),
        z.string().regex(/^\d{7,8}$/, "DNI no válido")
    ]).refine(value => value.trim() !== '', {
        message: "Email o DNI es requerido",
    }),
    password: z.string({
        required_error: 'Contraseña es requerida',
    }),
});
