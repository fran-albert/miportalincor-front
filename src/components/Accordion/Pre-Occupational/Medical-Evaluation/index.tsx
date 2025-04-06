import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DataValue } from "@/types/Data-Value/Data-Value";

interface Props {
  isEditing: boolean;
  dataValues?: DataValue[];
}

export default function MedicalEvaluationAccordion({ isEditing }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const medicalEvaluation = useSelector(
    (state: RootState) => state.preOccupational.formData.medicalEvaluation
  );

  // Función para calcular el IMC a partir de la talla y el peso
  const computeImc = () => {
    const { talla, peso } = medicalEvaluation.examenClinico;
    const heightInCm = parseFloat(talla);
    const weight = parseFloat(peso);
    if (!isNaN(heightInCm) && heightInCm > 0 && !isNaN(weight)) {
      const heightInM = heightInCm / 100;
      return (weight / (heightInM * heightInM)).toFixed(2);
    }
    return "";
  };

  // Actualizar "aspecto general"
  const handleAspectoGeneralChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          aspectoGeneral: e.target.value,
        },
      })
    );
  };

  // Actualizar "tiempo libre"
  const handleTiempoLibreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          tiempoLibre: e.target.value,
        },
      })
    );
  };

  // Actualizar campos de Examen Clínico y Signos Vitales
  const handleExamenClinicoChange = (
    field: keyof typeof medicalEvaluation.examenClinico,
    value: string
  ) => {
    const updatedExam = { ...medicalEvaluation.examenClinico, [field]: value };

    if (field === "talla" || field === "peso") {
      const heightInCm = parseFloat(updatedExam.talla);
      const weight = parseFloat(updatedExam.peso);
      if (!isNaN(heightInCm) && heightInCm > 0 && !isNaN(weight)) {
        const heightInM = heightInCm / 100;
        updatedExam.imc = (weight / (heightInM * heightInM)).toFixed(2);
      } else {
        updatedExam.imc = "";
      }
    }

    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          examenClinico: updatedExam,
        },
      })
    );
  };

  const handleExamenFisicoSelectedChange = (
    testId: string,
    selectedValue: "si" | "no"
  ) => {
    const current = medicalEvaluation.examenFisico[testId] || {
      selected: "",
      observaciones: "",
    };
    const newSelected = current.selected === selectedValue ? "" : selectedValue;
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          examenFisico: {
            ...medicalEvaluation.examenFisico,
            [testId]: { ...current, selected: newSelected },
          },
        },
      })
    );
  };

  const handleExamenFisicoObservacionesChange = (
    testId: string,
    value: string
  ) => {
    const current = medicalEvaluation.examenFisico[testId] || {
      selected: "",
      observaciones: "",
    };
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          examenFisico: {
            ...medicalEvaluation.examenFisico,
            [testId]: { ...current, observaciones: value },
          },
        },
      })
    );
  };

  const examenFisicoItems = [
    { id: "piel", label: "Piel y faneras", defaultValue: "" },
    { id: "ojos", label: "Ojos", defaultValue: "" },
    { id: "oidos", label: "Oídos", defaultValue: "" },
    { id: "nariz", label: "Nariz", defaultValue: "" },
    { id: "boca", label: "Boca", defaultValue: "" },
    { id: "faringe", label: "Faringe", defaultValue: "" },
    { id: "cuello", label: "Cuello", defaultValue: "" },
    {
      id: "respiratorio",
      label: "Aparato Respiratorio",
      defaultValue: "",
    },
    {
      id: "cardiovascular",
      label: "Aparato Cardiovascular",
      defaultValue: "",
    },
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

  return (
    <AccordionItem value="medical-evaluation" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Evaluación Médica
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-6">
          {/* Aspecto general */}
          <div className="space-y-2">
            <Label htmlFor="aspecto-general">Aspecto general</Label>
            {isEditing ? (
              <Input
                id="aspecto-general"
                value={medicalEvaluation.aspectoGeneral || ""}
                onChange={handleAspectoGeneralChange}
              />
            ) : (
              <Input
                id="aspecto-general"
                readOnly
                value={medicalEvaluation.aspectoGeneral || ""}
                onChange={handleAspectoGeneralChange}
              />
            )}
          </div>

          {/* Tiempo libre */}
          <div className="space-y-2">
            <Label htmlFor="tiempo-libre">Tiempo libre</Label>
            {isEditing ? (
              <Input
                id="tiempo-libre"
                value={medicalEvaluation.tiempoLibre || ""}
                onChange={handleTiempoLibreChange}
              />
            ) : (
              <Input
                id="tiempo-libre"
                value={medicalEvaluation.tiempoLibre || ""}
                readOnly
              />
            )}
          </div>

          {/* Examen Clínico */}
          <div className="space-y-4">
            <h4 className="font-bold text-base text-greenPrimary">
              Examen Clínico
            </h4>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Talla */}
              <div className="space-y-2">
                <Label htmlFor="talla">Talla</Label>
                {isEditing ? (
                  <Input
                    id="talla"
                    value={medicalEvaluation.examenClinico.talla || ""}
                    onChange={(e) =>
                      handleExamenClinicoChange("talla", e.target.value)
                    }
                  />
                ) : (
                  <Input
                    id="talla"
                    value={medicalEvaluation.examenClinico.talla || ""}
                    readOnly
                  />
                )}
              </div>
              {/* Peso */}
              <div className="space-y-2">
                <Label htmlFor="peso">Peso</Label>
                {isEditing ? (
                  <Input
                    id="peso"
                    value={medicalEvaluation.examenClinico.peso || ""}
                    onChange={(e) =>
                      handleExamenClinicoChange("peso", e.target.value)
                    }
                  />
                ) : (
                  <Input
                    id="peso"
                    value={medicalEvaluation.examenClinico.peso || ""}
                    readOnly
                  />
                )}
              </div>
              {/* IMC calculado */}
              <div className="space-y-2">
                <Label htmlFor="imc">IMC</Label>
                <div className="p-2 border rounded bg-gray-50" id="imc">
                  {computeImc()}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Perímetro Abdominal */}
              <div className="space-y-2">
                <Label htmlFor="perimetro-abdominal">Perímetro Abdominal</Label>
                {isEditing ? (
                  <Input
                    id="perimetro-abdominal"
                    value={
                      medicalEvaluation.examenClinico.perimetroAbdominal || ""
                    }
                    onChange={(e) =>
                      handleExamenClinicoChange(
                        "perimetroAbdominal",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <Input
                    id="perimetro-abdominal"
                    readOnly
                    value={
                      medicalEvaluation.examenClinico.perimetroAbdominal || ""
                    }
                  />
                )}
              </div>
              {/* Frecuencia Cardíaca */}
              <div className="space-y-2">
                <Label htmlFor="frecuencia-cardiaca">Frecuencia Cardíaca</Label>
                {isEditing ? (
                  <Input
                    id="frecuencia-cardiaca"
                    value={
                      medicalEvaluation.examenClinico.frecuenciaCardiaca || ""
                    }
                    onChange={(e) =>
                      handleExamenClinicoChange(
                        "frecuenciaCardiaca",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <Input
                    id="frecuencia-cardiaca"
                    value={
                      medicalEvaluation.examenClinico.frecuenciaCardiaca || ""
                    }
                    readOnly
                  />
                )}
              </div>
              {/* Frecuencia Respiratoria */}
              <div className="space-y-2">
                <Label htmlFor="frecuencia-respiratoria">
                  Frecuencia Respiratoria
                </Label>
                {isEditing ? (
                  <Input
                    id="frecuencia-respiratoria"
                    value={
                      medicalEvaluation.examenClinico.frecuenciaRespiratoria ||
                      ""
                    }
                    onChange={(e) =>
                      handleExamenClinicoChange(
                        "frecuenciaRespiratoria",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <Input
                    id="frecuencia-respiratoria"
                    value={
                      medicalEvaluation.examenClinico.frecuenciaRespiratoria ||
                      ""
                    }
                    readOnly
                  />
                )}
              </div>
              {/* Presión Sistólica */}
              <div className="space-y-2">
                <Label htmlFor="presion-sistolica">Presión Sistólica</Label>
                {isEditing ? (
                  <Input
                    id="presion-sistolica"
                    value={
                      medicalEvaluation.examenClinico.presionSistolica || ""
                    }
                    onChange={(e) =>
                      handleExamenClinicoChange(
                        "presionSistolica",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <Input
                    id="presion-sistolica"
                    value={
                      medicalEvaluation.examenClinico.presionSistolica || ""
                    }
                    readOnly
                  />
                )}
              </div>
              {/* Presión Diastólica */}
              <div className="space-y-2">
                <Label htmlFor="presion-diastolica">Presión Diastólica</Label>
                {isEditing ? (
                  <Input
                    id="presion-diastolica"
                    value={
                      medicalEvaluation.examenClinico.presionDiastolica || ""
                    }
                    onChange={(e) =>
                      handleExamenClinicoChange(
                        "presionDiastolica",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <Input
                    id="presion-diastolica"
                    value={
                      medicalEvaluation.examenClinico.presionDiastolica || ""
                    }
                    readOnly
                  />
                )}
              </div>
            </div>
          </div>

          {/* Examen físico */}
          <div className="space-y-6 mt-2">
            <h4 className="font-bold text-base text-greenPrimary">
              Examen físico (indique si se realizaron pruebas)
            </h4>
            {examenFisicoItems.map((item) => {
              const current = medicalEvaluation.examenFisico[item.id] || {
                selected: "",
                observaciones: item.defaultValue || "",
              };
              return (
                <div key={item.id} className="flex items-center gap-4">
                  <Label htmlFor={item.id} className="min-w-[150px]">
                    {item.label}
                  </Label>
                  {/* Checkbox para "Sí" */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${item.id}-si`}
                      checked={current.selected === "si"}
                      onCheckedChange={() =>
                        isEditing &&
                        handleExamenFisicoSelectedChange(item.id, "si")
                      }
                      disabled={!isEditing}
                      className="disabled:opacity-50"
                    />
                    <Label htmlFor={`${item.id}-si`}>Sí</Label>
                  </div>
                  {/* Checkbox para "No" */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${item.id}-no`}
                      checked={current.selected === "no"}
                      onCheckedChange={() =>
                        isEditing &&
                        handleExamenFisicoSelectedChange(item.id, "no")
                      }
                      disabled={!isEditing}
                      className="disabled:opacity-50"
                    />
                    <Label htmlFor={`${item.id}-no`}>No</Label>
                  </div>
                  {/* Input para observaciones - solo mostrar si "Sí" está seleccionado */}
                  {current.selected === "si" &&
                    (isEditing ? (
                      <Input
                        className="max-w-[200px]"
                        value={current.observaciones}
                        onChange={(e) =>
                          handleExamenFisicoObservacionesChange(
                            item.id,
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="p-2 border rounded bg-gray-50 max-w-[200px]">
                        {current.observaciones}
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
