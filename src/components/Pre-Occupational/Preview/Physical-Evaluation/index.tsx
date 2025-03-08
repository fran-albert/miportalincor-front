import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface PhysicalEvaluationPreviewProps {
  isForPdf?: boolean;
  section?: number;
}

export default function PhysicalEvaluationPreview({
  isForPdf = false,
  section,
}: PhysicalEvaluationPreviewProps) {
  const medicalEvaluation = useSelector(
    (state: RootState) => state.preOccupational.formData.medicalEvaluation
  );

  const section1 = [
    { id: "piel", label: "Piel y faneras", defaultValue: "" },
    { id: "ojos", label: "Ojos", defaultValue: "" },
    { id: "oidos", label: "Oídos", defaultValue: "" },
    { id: "nariz", label: "Nariz", defaultValue: "" },
    { id: "boca", label: "Boca", defaultValue: "" },
    { id: "faringe", label: "Faringe", defaultValue: "" },
  ];

  const section2 = [
    { id: "cuello", label: "Cuello", defaultValue: "" },
    { id: "respiratorio", label: "Aparato Respiratorio", defaultValue: "" },
    { id: "cardiovascular", label: "Aparato Cardiovascular", defaultValue: "" },
    { id: "digestivo", label: "Aparato Digestivo", defaultValue: "" },
    { id: "genitourinario", label: "Aparato Genitourinario", defaultValue: "" },
    { id: "locomotor", label: "Aparato Locomotor", defaultValue: "" },
    { id: "columna", label: "Columna", defaultValue: "" },
    { id: "miembros-sup", label: "Miembros Superiores", defaultValue: "" },
    { id: "miembros-inf", label: "Miembros Inferiores", defaultValue: "" },
    { id: "varices", label: "Várices", defaultValue: "" },
    { id: "sistema-nervioso", label: "Sistema Nervioso", defaultValue: "" },
    { id: "hernias", label: "Hernias", defaultValue: "" },
  ];

  const selectedSections =
    section === 1
      ? [section1]
      : section === 2
      ? [section2]
      : [section1, section2];

  return (
    <div className="border rounded-lg p-4">
      <div className="space-y-6">
        <h4 className="font-bold text-base text-greenPrimary">
          Examen físico (indique si se realizaron pruebas)
        </h4>

        {selectedSections.map((sectionItems, index) => (
          <div key={index} className="space-y-4">
            <h5 className="font-bold text-sm text-gray-600">
              {/* Puedes personalizar el título de cada sección si lo deseas */}
            </h5>

            {sectionItems.map((item) => {
              const current = medicalEvaluation.examenFisico[item.id] || {
                selected: "",
                observaciones: item.defaultValue || "Sin hallazgos",
              };

              return (
                <div key={item.id} className="flex items-center gap-4">
                  <Label className="min-w-[150px]">{item.label}</Label>

                  {!isForPdf && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={current.selected === "si"}
                        className="w-4 h-4"
                      />
                    </div>
                  )}

                  {isForPdf ? (
                    <p className="p-2 font-semibold">
                      {current.observaciones || "Sin observaciones"}
                    </p>
                  ) : (
                    <Input
                      id={`observaciones-${item.id}`}
                      value={current.observaciones}
                      readOnly
                      className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0 max-w-[200px]"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
