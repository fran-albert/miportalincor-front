import { z } from "zod";
import { isValidPesosInput } from "@/common/helpers/programMoney";
import { ProgramTariffType } from "@/types/Program/ProgramActivity";

const pricingFields = {
  tariffType: z.nativeEnum(ProgramTariffType, {
    required_error: "Seleccioná el tipo de arancel.",
  }),
  unitPricePesos: z
    .string({ required_error: "El precio es obligatorio." })
    .refine(isValidPesosInput, {
      message: "Ingresá un importe no negativo con hasta 2 decimales.",
    }),
};

export const CreateActivitySchema = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio." })
    .min(1, "El nombre no puede estar vacío."),
  description: z.string().optional(),
  assignedProfessionalUserId: z.string().optional(),
  ...pricingFields,
});

export const UpdateActivitySchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacío.").optional(),
  description: z.string().optional(),
  assignedProfessionalUserId: z.string().optional(),
  ...pricingFields,
});

export type CreateActivityFormValues = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityFormValues = z.infer<typeof UpdateActivitySchema>;
