import { z } from "zod";

export const bloodTestDataSchema = z.object({
    value: z.string({ required_error: "El valor es obligatorio." }),
    bloodTest: z
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
