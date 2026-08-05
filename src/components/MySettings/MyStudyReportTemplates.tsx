import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, FileText, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyStudyReportTemplates } from "@/hooks/StudyReport/useMyStudyReportTemplates";
import type { MyStudyReportTemplateSummary } from "@/types/StudyReport/StudyReport.types";
import { MyStudyReportTemplateDetail } from "./MyStudyReportTemplateDetail";

const byLabel = (
  a: MyStudyReportTemplateSummary,
  b: MyStudyReportTemplateSummary,
): number => a.label.localeCompare(b.label, "es");

const countLabel = (total: number): string =>
  total === 1 ? "1 estudio" : `${total} estudios`;

interface TemplateRowProps {
  template: MyStudyReportTemplateSummary;
}

const TemplateRow = ({ template }: TemplateRowProps) => (
  <AccordionItem
    value={template.templateKey}
    data-testid="template-row"
    className="border-b last:border-b-0"
  >
    <AccordionTrigger className="gap-3 hover:no-underline">
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1 pr-2 text-left sm:flex-row sm:items-center sm:gap-3">
        <span className="min-w-0 break-words font-medium text-gray-900">
          {template.label}
        </span>
        {!template.hasTemplate && (
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
            Sin plantilla
          </span>
        )}
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <MyStudyReportTemplateDetail templateKey={template.templateKey} />
    </AccordionContent>
  </AccordionItem>
);

/**
 * "Mis plantillas" — pantalla de SOLO LECTURA.
 *
 * Sirve para verificación, no para autoservicio: el profesional confirma que los
 * textos cargados son los suyos y avisa si falta algo. Por decisión explícita de
 * la v1 no hay ningún camino para editar, crear, borrar, clonar ni restaurar una
 * plantilla — ni siquiera un control deshabilitado.
 */
export const MyStudyReportTemplates = () => {
  const { data, isLoading, isError, refetch } = useMyStudyReportTemplates();

  const { mine, missing } = useMemo(() => {
    const templates = data ?? [];
    return {
      mine: templates.filter((t) => t.hasTemplate).sort(byLabel),
      missing: templates.filter((t) => !t.hasTemplate).sort(byLabel),
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="my-templates-loading">
        <Skeleton className="h-12 w-full" />
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  // Un error de carga NO es "no tenés plantillas": se muestra como error con
  // reintento, para no ocultar una falla detrás de un estado vacío.
  if (isError) {
    return (
      <div className="py-12 text-center" data-testid="my-templates-error">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-rose-400" />
        <p className="break-words text-lg text-muted-foreground">
          No se pudieron cargar tus plantillas
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => void refetch()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (mine.length === 0 && missing.length === 0) {
    return (
      <div className="py-12 text-center" data-testid="my-templates-empty">
        <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-30" />
        <p className="break-words text-lg text-muted-foreground">
          No hay tipos de estudio para mostrar
        </p>
        <p className="break-words text-sm text-muted-foreground">
          Cuando se habiliten estudios de ecografía vas a verlos acá
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      <div className="flex min-w-0 items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p className="min-w-0 break-words text-sm text-blue-900">
          Estos son los textos con los que arrancan tus informes. Es una vista de
          consulta: si falta una plantilla o algún texto no es el tuyo, avisale a
          la administración para que lo corrija.
        </p>
      </div>

      {mine.length === 0 && (
        <div
          className="flex min-w-0 items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3"
          data-testid="my-templates-none-loaded"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="min-w-0 break-words text-sm text-amber-900">
            Todavía no tenés plantillas cargadas. Los informes van a arrancar con
            los campos en blanco.
          </p>
        </div>
      )}

      {mine.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
              <CardTitle className="break-words text-lg font-bold text-gray-800">
                Mis plantillas
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {countLabel(mine.length)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {mine.map((template) => (
                <TemplateRow key={template.templateKey} template={template} />
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {missing.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
              <CardTitle className="break-words text-lg font-bold text-gray-800">
                Sin plantilla propia
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {countLabel(missing.length)}
              </span>
            </div>
            <p className="break-words text-sm text-muted-foreground">
              Vas a arrancar con los campos en blanco. Pedí la que te falte.
            </p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {missing.map((template) => (
                <TemplateRow key={template.templateKey} template={template} />
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
