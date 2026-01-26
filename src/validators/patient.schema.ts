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
 * Schema for updating a Patient
 * All fields are optional - only validate fields that are provided
 */
export const UpdatePatientSchema = z.object({
    userName: z.string().optional(), // DNI
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    phoneNumber: z.string().optional(),
    birthDate: z.string().optional(), // ISO date string
    photo: z.string().optional(),
    address: z.object({
        id: z.number().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        phoneNumber: z.string().optional(),
        city: z.object({
            id: z.number(),
            name: z.string(),
            state: z.object({
                id: z.number(),
                name: z.string(),
                country: z.object({
                    id: z.number(),
                    name: z.string(),
                }).optional(),
            }).optional(),
        }),
    }).optional(),
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
    phoneNumber2: z.string().optional(),
    bloodType: z.string().optional(),
    rhFactor: z.string().optional(),
    maritalStatus: z.string().optional(),
    affiliationNumber: z.string().optional(),
    gender: z.string().optional(),
    observations: z.string().optional(),
    died: z.string().optional(),
}).partial(); // Make all fields optional
