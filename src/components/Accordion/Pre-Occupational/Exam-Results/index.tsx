import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DataType } from "@/types/Data-Type/Data-Type";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";

interface ExamsResultsAccordionProps {
  isEditing: boolean;
  fields: DataType[];
  examResults: Record<string, string>;
  setExamResults: (er: Record<string, string>) => void;
  medicalEvaluationId: number;
}

export default function ExamsResultsAccordion({
  isEditing,
  fields,
  examResults,
  setExamResults,
  medicalEvaluationId
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

  const { createDataValuesMutation } = useDataValuesMutations();

  const handleSaveResults = () => {
    const payload = {
      medicalEvaluationId,
      dataValues: mappedExams
        .map((exam) => ({
          dataTypeId:
            fields.find((f) => f.name === exam.label)!.id,
          value: examResults[exam.id] || "",
        }))
        .filter((dv) => dv.value.trim() !== ""),
    };

    toast.promise(createDataValuesMutation.mutateAsync(payload), {
      loading: <LoadingToast message="Guardando datos..." />,
      success: <SuccessToast message="Datos guardados exitosamente!" />,
      error: <ErrorToast message="Error al guardar los datos" />,
    });
  };

  return (
    <AccordionItem value="resultados-examen" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Resultados del Examen
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        {mappedExams.map((exam) => (
          <div key={exam.id} className="space-y-2">
            <Label htmlFor={exam.id}>{exam.label}</Label>
            <Textarea
              id={exam.id}
              placeholder={`Ingrese resultados de ${exam.label.toLowerCase()}...`}
              disabled={!isEditing}
              value={examResults[exam.id] || ""}
              onChange={(e) =>
                setExamResults({
                  ...examResults,
                  [exam.id]: e.target.value,
                })
              }
              className="min-h-[100px] disabled:opacity-50"
            />
          </div>
        ))}

        <div className="flex justify-end gap-4 mt-2">
          <Button
            disabled={!isEditing || createDataValuesMutation.isPending}
            className="bg-greenPrimary hover:bg-teal-800"
            onClick={handleSaveResults}
          >
            {createDataValuesMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
