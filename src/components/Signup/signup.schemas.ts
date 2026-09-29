import { z } from "zod";

/**
 * Validaciones del asistente de alta. Son las mismas reglas que aplica el
 * backend (historia clínica valida todo de nuevo): acá solo evitan que el
 * paciente avance con un dato que después le van a rechazar.
 */

export const DNI_PATTERN = /^\d{7,8}$/;
/** Afiliado: dígitos, letras, guiones y barras; 4 a 30; al menos un dígito. */
export const AFFILIATION_NUMBER_PATTERN = /^(?=.*\d)[A-Z0-9/-]{4,30}$/;
export const MIN_PASSWORD_LENGTH = 8;

export const normalizeDni = (value: string): string =>
  value.replace(/[.\s-]/g, "");

/**
 * Celular argentino con característica: 10 dígitos, sin 0 ni 15
 * (341 555 1234). Acepta que lo escriban con +54 9, espacios o guiones.
 * Devuelve null si no es válido.
 */
export const normalizeArgentineMobile = (raw: string): string | null => {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("549")) {
    digits = digits.slice(3);
  } else if (digits.length === 12 && digits.startsWith("54")) {
    digits = digits.slice(2);
  }
  return /^[1-9]\d{9}$/.test(digits) ? digits : null;
};

/** "15/06/1991" → "1991-06-15"; null si la fecha no existe. */
export const parseBirthDate = (value: string): string | null => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
};

/** "1991-06-15" → "15/06/1991" (para mostrar). */
export const formatIsoDate = (iso: string): string => {
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yyyy}`;
};

/** Máscara mientras escribe: solo números y barras en DD/MM/AAAA. */
export const maskBirthDateInput = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export const normalizeAffiliationNumber = (value: string): string =>
  value.trim().toUpperCase();

export const dniSchema = z.object({
  dni: z
    .string()
    .transform(normalizeDni)
    .refine((value) => DNI_PATTERN.test(value), {
      message: "Escribí tu DNI: 7 u 8 números, sin puntos",
    }),
});

export const personalSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Completá tu nombre")
    .max(100, "El nombre es demasiado largo"),
  lastName: z
    .string()
    .trim()
    .min(1, "Completá tu apellido")
    .max(100, "El apellido es demasiado largo"),
  phone: z
    .string()
    .refine((value) => normalizeArgentineMobile(value) !== null, {
      message:
        "Escribí la característica y el número, sin 0 ni 15 (por ejemplo 341 555 1234)",
    }),
  email: z
    .string()
    .trim()
    .max(100, "El email es demasiado largo")
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "El email no tiene un formato válido",
    }),
  birthDate: z.string().superRefine((value, ctx) => {
    const iso = parseBirthDate(value);
    if (!iso) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Escribí tu fecha de nacimiento así: DD/MM/AAAA",
      });
      return;
    }
    const date = new Date(`${iso}T00:00:00`);
    if (date.getTime() > Date.now() || date.getFullYear() < 1900) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Revisá tu fecha de nacimiento",
      });
    }
  }),
});

export interface HealthInsuranceRules {
  requiresAffiliationNumber: boolean;
}

/** La obra social no se puede saltear; el afiliado depende de cuál sea. */
export const buildHealthInsuranceSchema = (
  selected: HealthInsuranceRules | null
) =>
  z
    .object({
      healthInsuranceId: z.number().nullable(),
      healthPlanId: z.number().nullable(),
      affiliationNumber: z.string(),
    })
    .superRefine((value, ctx) => {
      if (value.healthInsuranceId === null || selected === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["healthInsuranceId"],
          message: "Elegí tu obra social de la lista",
        });
        return;
      }
      if (value.healthPlanId === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["healthPlanId"],
          message: "Elegí tu plan",
        });
      }
      if (!selected.requiresAffiliationNumber) return;
      const affiliation = normalizeAffiliationNumber(value.affiliationNumber);
      if (affiliation === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["affiliationNumber"],
          message: "Completá tu número de afiliado",
        });
      } else if (!AFFILIATION_NUMBER_PATTERN.test(affiliation)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["affiliationNumber"],
          message:
            "Solo números, letras, guiones y barras, sin espacios (entre 4 y 30)",
        });
      }
    });

export const addressSchema = z.object({
  stateId: z.number({ invalid_type_error: "Elegí tu provincia" }).nullable().refine(
    (value) => value !== null,
    { message: "Elegí tu provincia" }
  ),
  cityId: z.number().nullable().refine((value) => value !== null, {
    message: "Elegí tu ciudad",
  }),
  street: z.string().trim().min(1, "Completá la calle").max(100),
  number: z.string().trim().min(1, "Completá el número").max(10, "Máximo 10 caracteres"),
  description: z.string().trim().max(255),
});

export const buildPasswordSchema = (dni: string) =>
  z
    .object({
      password: z
        .string()
        .min(MIN_PASSWORD_LENGTH, "Tiene que tener al menos 8 caracteres")
        .max(72, "Es demasiado larga"),
      confirmPassword: z.string(),
    })
    .superRefine((value, ctx) => {
      if (value.password.trim() === dni) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "No puede ser tu DNI. Elegí otra.",
        });
      }
      if (value.confirmPassword !== value.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: "Las contraseñas no coinciden",
        });
      }
    });

/** Primer mensaje de error por campo, para mostrar debajo de cada input. */
export const fieldErrors = (
  result: z.SafeParseReturnType<unknown, unknown>
): Record<string, string> => {
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
};
