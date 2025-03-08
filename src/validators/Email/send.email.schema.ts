import { z } from "zod";



export const emailSchema = z.object({
    to: z.string().email(),
    subject: z.string(),
    // collaboratorName: z.string(),
    // fileData: z.array(fileSchema)
});

