import { z } from "zod";

export const bloodTestSchema = z.object({
    originalName: z.string({ required_error: "El nombre es obligatorio." }),
    parsedName: z.string().optional(),
    unit: z
        .object({
            id: z.number({ required_error: "La unidad es obligatoria." }),
            name: z.string().optional(),
            shortName: z.string().optional(),
        })
        .optional(),
    referenceValue: z.string().optional(),
    idUnit: z.number().optional(),
});

export const unitSchema = z.object({
    id: z.number().optional(),
    name: z.string().optional(),
    shortName: z.string().optional(),
});
