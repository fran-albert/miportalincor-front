import { z } from 'zod';
import { UserSchema } from './user.schema';

export const PatientSchema = UserSchema.extend({
    affiliationNumber: z.string({ required_error: "El número de obra social es obligatorio" }).min(1, { message: "El número de obra social es obligatorio" }),
    healthPlans: z.array(z.object({
        id: z.number(),
        name: z.string(),
    }), { required_error: "Debe seleccionar una obra social." }).min(1, { message: "Debe seleccionar al menos una obra social." }),

});

/**
 * Schema for updating a Patient.
 * Derives from PatientSchema (which includes UserSchema) so all form fields
 * like address.description, state union, observations, etc. are present.
 * healthPlans is overridden to include healthInsurance (needed by the edit form).
 * .partial() makes all fields optional for partial updates.
 */
export const UpdatePatientSchema = PatientSchema.extend({
    healthPlans: z.array(z.object({
        id: z.number(),
        name: z.string(),
        healthInsurance: z.object({
            id: z.number(),
            name: z.string(),
        }),
    })).optional(),
    registeredById: z.string().optional(),
    cuil: z.string().optional(),
    cuit: z.string().optional(),
    died: z.string().optional(),
}).partial();
