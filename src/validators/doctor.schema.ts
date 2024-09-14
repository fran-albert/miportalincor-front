import { z } from 'zod';
import { UserSchema } from './user.schema';

export const DoctorSchema = UserSchema.extend({
    matricula: z.string({ required_error: 'Este campo es obligatorio.' }),
    specialities: z.array(z.object({
        id: z.number(),
        name: z.string(),
    })).optional(),
    healthInsurances: z.array(z.object({
        id: z.number(),
        name: z.string(),
    })).optional(),
});
