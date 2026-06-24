import { ExamResults } from "@/common/helpers/examsResults.maps";

export const examResultRows = [
  { label: "Clinico", valueKey: "clinico" },
  { label: "Audiometria", valueKey: "audiometria" },
  { label: "Psicotecnico", valueKey: "psicotecnico" },
  { label: "RX torax frente", valueKey: "rx-torax" },
  { label: "Electrocardiograma", valueKey: "electrocardiograma-result" },
  { label: "Laboratorio basico ley", valueKey: "laboratorio" },
  { label: "Electroencefalograma", valueKey: "electroencefalograma" },
] as const;

export const normalizeResultValue = (value?: string): string | null => {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  if (!/\s/.test(text) && text.length > 72) {
    return `${text.slice(0, 69)}...`;
  }

  return text;
};

export const getVisibleExamResultRows = (examResults?: ExamResults) =>
  examResultRows
    .map((row) => ({
      ...row,
      value: normalizeResultValue(examResults?.[row.valueKey]),
    }))
    .filter((row): row is typeof row & { value: string } => row.value !== null);
