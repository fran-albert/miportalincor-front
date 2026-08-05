import { useQuery } from "@tanstack/react-query";
import {
  getMyStudyReportTemplate,
  getMyStudyReportTemplates,
} from "@/api/StudyReport/study-report.actions";

export const myStudyReportTemplateKeys = {
  all: ["study-reports", "my-templates"] as const,
  detail: (templateKey: string) =>
    ["study-reports", "my-templates", templateKey] as const,
};

interface UseMyStudyReportTemplatesOptions {
  enabled?: boolean;
}

/**
 * Listado de los tipos de estudio con el indicador de si el profesional
 * autenticado tiene plantilla propia. Solo lectura: no hay mutations.
 */
export const useMyStudyReportTemplates = ({
  enabled = true,
}: UseMyStudyReportTemplatesOptions = {}) =>
  useQuery({
    queryKey: myStudyReportTemplateKeys.all,
    queryFn: getMyStudyReportTemplates,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

/**
 * Detalle de una plantilla: los campos del estudio en orden, con el texto con
 * el que arranca cada uno. Se dispara solo cuando hay un `templateKey`.
 */
export const useMyStudyReportTemplate = (templateKey: string) =>
  useQuery({
    queryKey: myStudyReportTemplateKeys.detail(templateKey),
    queryFn: () => getMyStudyReportTemplate(templateKey),
    enabled: templateKey.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
