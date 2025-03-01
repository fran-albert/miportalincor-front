import { format, parse } from "date-fns";
import moment from "moment-timezone";
import { UseFormSetValue } from "react-hook-form";

export function formatDni(dni: string): string {
  let dniStr = dni?.toString();
  let dniReversed = dniStr?.split("").reverse().join("");
  let dniConPuntos = dniReversed?.match(/.{1,3}/g)?.join(".") || "";
  return dniConPuntos.split("").reverse().join("");
}
export function formatMatricula(matricula: string): string {
  let dniStr = matricula?.toString();
  let dniReversed = dniStr?.split("").reverse().join("");
  let dniConPuntos = dniReversed?.match(/.{1,3}/g)?.join(".") || "";
  return dniConPuntos.split("").reverse().join("");
}

export function getGenderLabel(gender: string): string {
  return gender === 'male' ? 'Masculino' : 'Femenino';
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  // const hours = date.getHours().toString().padStart(2, "0");
  // const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}-${month}-${year} `;
}
export function formatDateWithTime(dateString: string): string {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes} `;
}

export function calculateAge(birthDate: string): number {
  const date = new Date(birthDate);
  const ageDifMs = Date.now() - date.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
export function capitalizeWords(input: any) {
  return input.toLowerCase().replace(/(?:^|\s)\S/g, function (a: any) { return a.toUpperCase(); });
}

export function getInitials(name: string, lastName: string): string {
  const nameInitial = name.charAt(0).toUpperCase();
  const lastNameInitial = lastName.charAt(0).toUpperCase();
  return `${nameInitial}${lastNameInitial}`;
}

export const handleDateChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>,
  setValue: UseFormSetValue<any>,
  fieldName: string
) => {
  const value = e.target.value;
  const dateInArgentina = moment.tz(value, "America/Argentina/Buenos_Aires");
  const formattedDateISO = dateInArgentina.toISOString();

  setStartDate(new Date(value));
  setValue(fieldName, formattedDateISO);
};

export const formatCuilCuit = (numero: number | string): string => {
  let str: string = numero.toString().replace(/\D/g, '');

  if (str.length !== 11) {
    return "Número inválido, debe tener 11 dígitos.";
  }

  return `${str.slice(0, 2)}-${str.slice(2, 10)}-${str.slice(10)}`;
};

export const sleep = (seconds: number): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, seconds * 1000);
  });
}

export const goBack = () => {
  window.history.back();
};

export const slugify = (text: string, id: number) => {
  return `${text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')}-${id}`;
};

export const parseSlug = (slug: string) => {
  const slugParts = slug.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  // Extraer el nombre sin el ID
  const nameParts = slugParts.slice(0, -1).join(" ");
  const formattedName = nameParts
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return { id, formattedName };
};


export const normalizeDate = (date: string): string => {
  try {
    if (!date || date.trim() === "") {
      throw new Error("Fecha vacía o indefinida");
    }

    // Si la fecha está en formato ISO (2025-01-06T03:00:00)
    if (date.includes("T")) {
      return format(new Date(date), "yyyy-MM-dd"); // Formateamos a YYYY-MM-DD
    }

    // Si la fecha está en formato DD-MM-YYYY
    if (date.includes("-")) {
      const parts = date.split("-");
      if (parts[0].length === 4) {
        // Si es YYYY-MM-DD
        return date;
      } else if (parts[2].length === 4) {
        // Si es DD-MM-YYYY
        const parsedDate = parse(date, "dd-MM-yyyy", new Date());
        return format(parsedDate, "yyyy-MM-dd");
      }
    }

    throw new Error(`Formato de fecha no reconocido: ${date}`);
  } catch (error) {
    console.error("Fecha problemática:", date);
    return "";
  }
};

