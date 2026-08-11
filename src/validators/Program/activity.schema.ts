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
  // El descuento del programa se decide por rubro: nutrición y psicología sí,
  // gimnasio no. Nada que ver con cómo se cobra la actividad.
  discountEligible: z.boolean().default(true),
};

const optionalProfessionalUserId = z
  .string()
  .nullish()
  .transform((value) => value ?? undefined);

export const CreateActivitySchema = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio." })
    .min(1, "El nombre no puede estar vacío."),
  description: z.string().optional(),
  assignedProfessionalUserId: optionalProfessionalUserId,
  ...pricingFields,
});

export const UpdateActivitySchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacío.").optional(),
  description: z.string().optional(),
  assignedProfessionalUserId: optionalProfessionalUserId,
  ...pricingFields,
});

export type CreateActivityFormValues = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityFormValues = z.infer<typeof UpdateActivitySchema>;
