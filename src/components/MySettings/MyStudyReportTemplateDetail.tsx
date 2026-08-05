import { AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyStudyReportTemplate } from "@/hooks/StudyReport/useMyStudyReportTemplates";
import type {
  MyStudyReportTemplateField,
  StudyReportFieldType,
} from "@/types/StudyReport/StudyReport.types";

interface MyStudyReportTemplateDetailProps {
  templateKey: string;
}

const FIELD_TYPE_LABELS: Record<StudyReportFieldType, string | null> = {
  text: null,
  number: "Numérico",
  select: "Opción",
};

const hasText = (field: MyStudyReportTemplateField): boolean =>
  typeof field.text === "string" && field.text.trim().length > 0;

/**
 * Detalle de una plantilla propia: los campos del estudio en orden, cada uno con
 * el texto exacto con el que va a arrancar el informe.
 *
 * SOLO LECTURA por decisión de la v1: no hay inputs, ni textareas, ni botones de
 * edición deshabilitados. Lo que se ve es texto renderizado.
 */
export const MyStudyReportTemplateDetail = ({
  templateKey,
}: MyStudyReportTemplateDetailProps) => {
  const { data, isLoading, isError, refetch } =
    useMyStudyReportTemplate(templateKey);

  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="template-detail-loading">
        <Skeleton className="h-5 w-2/3 max-w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  // Un error de carga NO es "esta plantilla no tiene textos": se muestra como
  // error con reintento para no disfrazar una falla de estado vacío.
  if (isError || !data) {
    return (
      <div className="py-8 text-center" data-testid="template-detail-error">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-rose-400" />
        <p className="break-words text-sm text-muted-foreground">
          No se pudo cargar esta plantilla
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => void refetch()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3" data-testid="template-detail">
      {!data.hasTemplate && (
        <div className="flex min-w-0 items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="min-w-0 break-words text-sm text-amber-900">
            No tenés plantilla propia para este estudio: vas a arrancar con los
            campos en blanco.
          </p>
        </div>
      )}

      {data.fields.length === 0 ? (
        <p className="break-words text-sm text-muted-foreground">
          Este estudio no tiene campos configurados.
        </p>
      ) : (
        <ul className="w-full space-y-3">
          {data.fields.map((field) => {
            const typeLabel = FIELD_TYPE_LABELS[field.type];

            return (
              <li
                key={field.key}
                data-testid="template-field"
                className="w-full rounded-md border border-gray-200 bg-white p-3"
              >
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="min-w-0 break-words text-sm font-semibold text-gray-900">
                    {field.label}
                  </span>
                  {typeLabel && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                      {typeLabel}
                    </span>
                  )}
                </div>

                {hasText(field) ? (
                  <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
                    {field.text}
                  </p>
                ) : (
                  <p className="mt-1.5 break-words text-sm italic text-muted-foreground">
                    Sin texto — este campo arranca vacío
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
