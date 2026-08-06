import { z } from 'zod';

export const loginSchema = z.object({
    userName: z.union([
        z.string({
            required_error: 'DNI o correo electrónico es requerido.',
        }),
        z.string().regex(/^\d{6,8}$/, "DNI no válido")
    ]).refine(value => value.trim() !== '', {
        message: "DNI o correo electrónico es requerido",
    }),
    password: z.string({
        required_error: 'Contraseña es requerida',
    }),
});
