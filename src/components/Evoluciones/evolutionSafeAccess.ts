import { formatDoctorName } from "@/common/helpers/helpers";
import { Evolucion, EvolucionData } from "@/types/Antecedentes/Antecedentes";

export type EvolutionDoctor = NonNullable<Evolucion["doctor"]>;
export type NormalizedEvolutionDoctor = {
  userId: number;
  firstName: string;
  lastName: string;
  gender?: string;
  specialities: EvolutionDoctor["specialities"];
};

export const UNKNOWN_DOCTOR_LABEL = "Médico no registrado";

export const getEvolutionData = (evolucion: Evolucion): EvolucionData[] =>
  Array.isArray(evolucion.data) ? evolucion.data : [];

export const getEvolutionDataTypeName = (dataItem: EvolucionData): string =>
  dataItem.dataType?.name?.toLowerCase() ?? "";

export const getEvolutionDataTypeCategory = (dataItem: EvolucionData): string =>
  dataItem.dataType?.category ?? "";

export const getDoctorDisplayName = (doctor?: Evolucion["doctor"]): string =>
  formatDoctorName(doctor);

export const getDoctorInitials = (doctor?: Evolucion["doctor"]): string => {
  const firstInitial = doctor?.firstName?.trim()?.[0] ?? "";
  const lastInitial = doctor?.lastName?.trim()?.[0] ?? "";
  const initials = `${firstInitial}${lastInitial}`.toUpperCase();

  return initials || "NR";
};

export const getDoctorSpecialities = (
  doctor?: Evolucion["doctor"]
): EvolutionDoctor["specialities"] =>
  Array.isArray(doctor?.specialities) ? doctor.specialities : [];

export const normalizeEvolutionDoctor = (
  doctor?: Evolucion["doctor"]
): NormalizedEvolutionDoctor => ({
  userId: doctor?.userId ?? 0,
  firstName: doctor?.firstName ?? "",
  lastName: doctor?.lastName ?? "",
  gender: doctor?.gender ?? undefined,
  specialities: getDoctorSpecialities(doctor),
});

export const getFechaConsultaFromEvolution = (evolucion: Evolucion): string => {
  const fechaData = getEvolutionData(evolucion).find(
    (dataItem) => getEvolutionDataTypeName(dataItem) === "fecha de consulta"
  );

  if (fechaData?.value) return fechaData.value;
  if (evolucion.createdAt) return evolucion.createdAt;

  return "";
};
