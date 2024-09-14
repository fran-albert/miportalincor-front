import { z } from 'zod';

export const UserSchema = z.object({
    firstName: z.string({ required_error: "Este campo es obligatorio." }).max(255),
    lastName: z.string({ required_error: "Este campo es obligatorio." }).max(255),
    email: z.string().email().optional(),
    userName: z.string({ required_error: "Este campo es obligatorio." }),
    phoneNumber: z.string({ required_error: "Este campo es obligatorio." },),
    photo: z.string().optional(),
    phoneNumber2: z.string().optional(),
    birthDate: z.union([z.string({ required_error: "Este campo es obligatorio." }), z.date()]),
    address: z.object({
        id: z.number().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        city: z.object({
            id: z.number(),
            name: z.string({ required_error: "Este campo es obligatorio." }),
            state: z.object({
                id: z.number(),
                name: z.string({ required_error: "Este campo es obligatorio." }),
            }),
        }),
        phoneNumber: z.string().optional(),
        description: z.string().optional(),
    }),
    observations: z.string().optional(),
    rhFactor: z.string().optional(),
    maritalStatus: z.string().optional(),
    bloodType: z.string().optional(),
    gender: z.string({ required_error: "Este campo es obligatorio." }),
});

export const ResetPasswordSchema = z.object({
    password: z.string({ required_error: "Este campo es obligatorio." }),
    confirmPassword: z.string({ required_error: "Este campo es obligatorio." }),
});

export const RequestEmailPasswordSchema = z.object({
    email: z.string({ required_error: "Este campo es obligatorio." }).email(),
});

export const ChangePasswordSchema = z.object({
    currentPassword: z.string({ required_error: "Este campo es obligatorio." }),
    newPassword: z.string({ required_error: "Este campo es obligatorio." }),
    confirmPassword: z.string({ required_error: "Este campo es obligatorio." }),
});