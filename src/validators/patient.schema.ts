import { z } from 'zod';
import { UserSchema } from './user.schema';

export const PatientSchema = UserSchema.extend({
    affiliationNumber: z.string().optional(),
    healthPlans: z.array(z.object({
        id: z.number(),
        name: z.string(),
    })).optional(),

});
