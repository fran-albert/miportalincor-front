import { z } from "zod";

const fileSchema = z.object({
    url: z.string().url()
});

export const emailSchema = z.object({
    to: z.string().email(),
    subject: z.string(),
    // collaboratorName: z.string(),
    // fileData: z.array(fileSchema)
});

