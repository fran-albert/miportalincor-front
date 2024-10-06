import { z } from "zod";

export const StudySchema = z.object({
    StudyTypeId: z.string().nonempty(),
    date: z.date(),
    Note: z.string().nonempty(),
    StudyFiles: z.array(z.any()),
});