import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ConclusionAccordionProps {
  isEditing: boolean;
  conclusion: string;
  recomendaciones: string;
  setConclusion: (c: string) => void;
  setRecomendaciones: (r: string) => void;
  standalone?: boolean;
}

export default function ConclusionAccordion({
  isEditing,
  conclusion,
  recomendaciones,
  setConclusion,
  setRecomendaciones,
  standalone = false,
}: ConclusionAccordionProps) {
  const content = (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-slate-600">
        Cerrá el examen con una conclusión concreta. Usá recomendaciones solo
        si necesitás dejar indicaciones adicionales para la entrega.
      </p>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-2">
          <div className="space-y-1">
            <Label
              htmlFor="conclusion"
              className="text-sm font-semibold text-greenPrimary"
            >
              Conclusión
            </Label>
            <p className="text-xs leading-5 text-slate-500">
              Definí el cierre clínico principal del examen.
            </p>
          </div>
          <Textarea
            id="conclusion"
            placeholder="Ej.: Apto para tareas habituales, sin hallazgos de relevancia clínica."
            disabled={!isEditing}
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            className="min-h-[152px] resize-y border-slate-200 bg-white text-sm leading-6 shadow-none"
          />
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <Label
              htmlFor="recomendaciones"
              className="text-sm font-semibold text-greenPrimary"
            >
              Recomendaciones
            </Label>
            <p className="text-xs leading-5 text-slate-500">
              Campo opcional para indicaciones complementarias.
            </p>
          </div>
          <Textarea
            id="recomendaciones"
            placeholder="Ej.: Control anual, seguimiento clínico o uso de elementos de protección."
            disabled={!isEditing}
            value={recomendaciones}
            onChange={(e) => setRecomendaciones(e.target.value)}
            className="min-h-[104px] resize-y border-slate-200 bg-white text-sm leading-6 shadow-none"
          />
        </div>
      </div>
    </div>
  );

  if (standalone) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-4 text-base font-semibold text-greenPrimary">
          Conclusión
        </div>
        {content}
      </div>
    );
  }

  return (
    <AccordionItem value="conclusion" className="rounded-lg border border-slate-200 bg-white">
      <AccordionTrigger className="px-4 text-lg font-bold text-greenPrimary">
        Conclusión
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">{content}</AccordionContent>
    </AccordionItem>
  );
}
