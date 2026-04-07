import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; 
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DataType } from "@/types/Data-Type/Data-Type";

interface ExamsResultsAccordionProps {
  isEditing: boolean;
  fields: DataType[];
  examResults: Record<string, string>;
  setExamResults: (er: Record<string, string>) => void;
  standalone?: boolean;
}

export default function ExamsResultsAccordion({
  isEditing,
  fields,
  examResults,
  setExamResults,
  standalone = false,
}: ExamsResultsAccordionProps) {
  const examFilter = [
    { id: "clinico", name: "Clínico" },
    { id: "electrocardiograma-result", name: "Electrocardiograma" },
    { id: "laboratorio", name: "Laboratorio básico ley" },
    { id: "rx-torax", name: "RX Torax Frente" },
    { id: "electroencefalograma", name: "Electroencefalograma" },
    { id: "psicotecnico", name: "Psicotécnico" },
    { id: "audiometria", name: "Audiometria" },
  ];

  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Filtrar y deduplicar campos STRING & GENERAL
  const exams = fields
    .filter(
      (f) =>
        f.dataType === "STRING" &&
        f.category === "GENERAL" &&
        examFilter.some((e) => normalize(e.name) === normalize(f.name))
    )
    .reduce((acc: DataType[], curr) => {
      if (!acc.find((x) => x.name === curr.name)) acc.push(curr);
      return acc;
    }, []);

  const mappedExams = exams.map((exam) => ({
    id:
      examFilter.find((e) => normalize(e.name) === normalize(exam.name))
        ?.id || exam.id.toString(),
    label: exam.name,
  }));

  const content = (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-slate-600">
        Registrá un resumen breve de cada estudio. Si necesitás más detalle,
        usá el campo como observación clínica corta.
      </p>
      <div className="grid gap-x-6 gap-y-5 xl:grid-cols-2">
        {mappedExams.map((exam) => (
          <div key={exam.id} className="space-y-2">
            <div className="space-y-1">
              <Label
                htmlFor={exam.id}
                className="text-sm font-semibold text-greenPrimary"
              >
                {exam.label}
              </Label>
              <p className="text-xs leading-5 text-slate-500">
                Resultado resumido para el informe laboral.
              </p>
            </div>
            <Textarea
              id={exam.id}
              placeholder={`Ej.: ${exam.label} sin alteraciones relevantes`}
              disabled={!isEditing}
              value={examResults[exam.id] || ""}
              onChange={(e) =>
                setExamResults({
                  ...examResults,
                  [exam.id]: e.target.value,
                })
              }
              className="min-h-[88px] resize-y border-slate-200 bg-white text-sm leading-6 shadow-none disabled:opacity-60"
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (standalone) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-4 text-base font-semibold text-greenPrimary">
          Resultados del examen
        </div>
        {content}
      </div>
    );
  }

  return (
    <AccordionItem value="resultados-examen" className="rounded-lg border border-slate-200 bg-white">
      <AccordionTrigger className="px-4 text-lg font-bold text-greenPrimary">
        Resultados del Examen
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">{content}</AccordionContent>
    </AccordionItem>
  );
}
