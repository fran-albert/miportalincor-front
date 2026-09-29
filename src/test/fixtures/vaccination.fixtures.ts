import type {
  VaccinationApplication,
  VaccinationCard,
  VaccinationCardItem,
  VaccinationCardStatus,
  VaccinationVaccine,
} from "@/types/Vaccination/Vaccination";

export const buildVaccine = (
  code: string,
  name: string,
  description?: string
): VaccinationVaccine => ({
  id: `vaccine-${code}`,
  code,
  name,
  description,
  active: true,
});

interface BuildApplicationInput {
  id: string;
  vaccine: VaccinationVaccine;
  doseLabel: string;
  appliedDate: string;
  canEdit?: boolean;
  observations?: string;
  doctor?: { firstName: string; lastName: string };
  createdAt?: string;
}

export const buildApplication = ({
  id,
  vaccine,
  doseLabel,
  appliedDate,
  canEdit = false,
  observations,
  doctor = { firstName: "Juliana", lastName: "Albert Rolandi" },
  createdAt = `${appliedDate}T15:00:00.000Z`,
}: BuildApplicationInput): VaccinationApplication => ({
  id,
  patientUserId: "patient-uuid",
  vaccineId: vaccine.id,
  scheduleRuleId: `rule-${id}`,
  doseLabel,
  appliedDate,
  observations,
  doctorUserId: "doctor-uuid",
  doctor: { id: "doctor-uuid", ...doctor },
  vaccine,
  canEdit,
  createdAt,
  updatedAt: createdAt,
});

interface BuildItemInput {
  scheduleRuleId: string;
  vaccine: VaccinationVaccine;
  doseLabel: string;
  status: VaccinationCardStatus;
  recommendedDate?: string;
  overdueDate?: string;
  application?: VaccinationApplication;
}

export const buildItem = ({
  scheduleRuleId,
  vaccine,
  doseLabel,
  status,
  recommendedDate,
  overdueDate,
  application,
}: BuildItemInput): VaccinationCardItem => ({
  scheduleRuleId,
  vaccineId: vaccine.id,
  vaccine,
  doseLabel,
  status,
  recommendedDate,
  overdueDate,
  application,
});

// Catalogo real sembrado en incor-historia-clinica.api
// (data/migrations/1770100000000-create-vaccination-card.ts): 29 dosis
// pediatricas, todas con overdueAgeMonths <= 144 (12 anios).
const PEDIATRIC_RULES: Array<[string, string, string, number, number]> = [
  ["bcg", "BCG", "Unica dosis", 0, 1],
  ["hepatitis_b", "Hepatitis B", "Neonatal", 0, 1],
  ["neumococo_conjugada", "Neumococo conjugada", "1ra dosis", 2, 3],
  ["neumococo_conjugada", "Neumococo conjugada", "2da dosis", 4, 5],
  ["neumococo_conjugada", "Neumococo conjugada", "Refuerzo", 12, 13],
  ["rotavirus", "Rotavirus", "1ra dosis", 2, 3],
  ["rotavirus", "Rotavirus", "2da dosis", 4, 5],
  ["quintuple_pentavalente", "Quintuple/Pentavalente", "1ra dosis", 2, 3],
  ["quintuple_pentavalente", "Quintuple/Pentavalente", "2da dosis", 4, 5],
  ["quintuple_pentavalente", "Quintuple/Pentavalente", "3ra dosis", 6, 7],
  ["ipv_salk", "IPV/Salk", "1ra dosis", 2, 3],
  ["ipv_salk", "IPV/Salk", "2da dosis", 4, 5],
  ["ipv_salk", "IPV/Salk", "3ra dosis", 6, 7],
  ["ipv_salk", "IPV/Salk", "Refuerzo ingreso escolar", 60, 72],
  ["meningococo", "Meningococo", "1ra dosis", 3, 4],
  ["meningococo", "Meningococo", "2da dosis", 5, 6],
  ["meningococo", "Meningococo", "Refuerzo", 15, 18],
  ["meningococo", "Meningococo", "11 anios", 132, 144],
  ["gripe", "Gripe", "1ra dosis pediatrica", 6, 7],
  ["gripe", "Gripe", "2da dosis pediatrica si corresponde", 7, 8],
  ["hepatitis_a", "Hepatitis A", "Unica dosis", 12, 13],
  ["triple_viral", "Triple viral", "1ra dosis", 12, 13],
  ["triple_viral", "Triple viral", "2da dosis", 60, 72],
  ["varicela", "Varicela", "1ra dosis", 15, 18],
  ["varicela", "Varicela", "2da dosis", 60, 72],
  ["triple_bacteriana_celular", "Triple bacteriana celular", "1er refuerzo", 15, 18],
  ["triple_bacteriana_celular", "Triple bacteriana celular", "Refuerzo ingreso escolar", 60, 72],
  ["vph", "VPH", "Unica dosis", 132, 144],
  ["dtpa", "dTpa", "11 anios", 132, 144],
];

const addMonths = (isoDate: string, months: number): string => {
  const [year, month, day] = isoDate.split("-").map(Number);
  const totalMonths = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;
  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
};

/**
 * Replica lo que devuelve GET /vaccination/card para una paciente adulta
 * (nacida en 1978) con dos aplicaciones: las 27 dosis restantes del
 * calendario infantil llegan con status "overdue".
 */
export const buildAdultCard = (): VaccinationCard => {
  const birthDate = "1978-03-12";
  const gripe = buildVaccine("gripe", "Gripe", "Influenza");
  const tripleViral = buildVaccine(
    "triple_viral",
    "Triple viral",
    "Sarampion, rubeola y paperas"
  );
  const applications = [
    buildApplication({
      id: "app-gripe",
      vaccine: gripe,
      doseLabel: "1ra dosis pediatrica",
      appliedDate: "2026-04-15",
    }),
    buildApplication({
      id: "app-triple",
      vaccine: tripleViral,
      doseLabel: "1ra dosis",
      appliedDate: "2026-09-28",
    }),
  ];

  const items = PEDIATRIC_RULES.map(
    ([code, name, doseLabel, recommended, overdue], index) => {
      const vaccine = buildVaccine(code, name);
      const application = applications.find(
        (candidate) =>
          candidate.vaccine?.code === code && candidate.doseLabel === doseLabel
      );
      return buildItem({
        scheduleRuleId: application?.scheduleRuleId ?? `rule-${index}`,
        vaccine,
        doseLabel,
        status: application ? "applied" : "overdue",
        recommendedDate: addMonths(birthDate, recommended),
        overdueDate: addMonths(birthDate, overdue),
        application,
      });
    }
  );

  return {
    patientUserId: "patient-uuid",
    patient: {
      id: "patient-uuid",
      firstName: "Juliana",
      lastName: "Albert Rolandi",
      userName: "25123456",
      birthDate,
    },
    generatedAt: "2026-09-28",
    counts: { applied: 2, pending: 0, overdue: 27, upcoming: 0 },
    items,
    applications,
    canAddApplications: false,
  };
};
