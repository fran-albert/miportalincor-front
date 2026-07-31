import type { StudyReportTemplate } from "@/types/StudyReport/StudyReport.types";

/**
 * Contenido inicial de una plantilla: cada campo arranca con su texto normal
 * y la médica edita sólo lo patológico. Espeja `getDefaultContent` del backend,
 * que es el que siembra los defaults al crear el borrador.
 */
export const buildTemplateDefaults = (
  template: StudyReportTemplate | undefined,
): Record<string, unknown> => {
  if (!template) return {};

  return template.fields.reduce<Record<string, unknown>>((content, field) => {
    if (field.default !== undefined) {
      content[field.key] = field.default;
    }
    return content;
  }, {});
};
