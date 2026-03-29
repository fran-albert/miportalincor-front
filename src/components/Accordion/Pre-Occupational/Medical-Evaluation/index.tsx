import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  Circulatorio,
  Gastrointestinal,
  Genitourinario,
  Neurologico,
  Osteoarticular,
  Respiratorio,
  setReportVisibilityOverride,
  setFormData,
  Torax,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AspectoGeneralCheckboxes from "./AspectoGeneralCheckbox";
import { VisualAcuityCard } from "./Visual";
import { OsteoarticularSection } from "./OsteoArticularSection";
import { GenitourinarioSection } from "./GenitourinarioSection";
import { GastrointestinalSection } from "./GastrointestinalSection";
import { NeurologicoSection } from "./NeurologicoSection";
import { CirculatorioSection } from "./CirculatorioSection";
import { RespiratorioSection } from "./RespiratorioSection";
import { ToraxSection } from "./ToraxSection";
import { Bucodental, BucodentalSection } from "./BucodentalSection";
import { CabezaCuello, CabezaCuelloSection } from "./CabellaCuelloSection";
import { PielSection, Piel } from "./PielSection";
import { useState } from "react";
import { ClinicalBlock } from "./FormPrimitives";

interface Props {
  isEditing: boolean;
  standalone?: boolean;
}

export default function MedicalEvaluationAccordion({
  isEditing,
  standalone = false,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const medicalEvaluation = useSelector(
    (state: RootState) => state.preOccupational.formData.medicalEvaluation
  );
  const reportVisibilityOverrides = useSelector(
    (state: RootState) => state.preOccupational.reportVisibilityOverrides
  );

  const [activeSection, setActiveSection] = useState<
    | "clinical"
    | "visual"
    | "skin"
    | "head-neck"
    | "oral"
    | "thorax"
    | "respiratory"
    | "circulatory"
    | "neurological"
    | "gastrointestinal"
    | "genitourinary"
    | "osteoarticular"
  >("clinical");

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
  const handleAspectoGeneralChange = (value: string) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          aspectoGeneral: value,
        },
      })
    );
  };
  const circulatorio: Circulatorio = medicalEvaluation.circulatorio ?? {
    frecuenciaCardiaca: "",
    presion: "",
    sinAlteraciones: undefined,
    observaciones: "",
  };

  const handleCirculatorioChange = (
    field: keyof Circulatorio,
    value: boolean | string | undefined
  ) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          circulatorio: {
            ...circulatorio,
            [field]: value,
          },
        },
      })
    );
  };
  const handleCirculatorioBatchChange = (updates: Partial<Circulatorio>) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          circulatorio: { ...circulatorio, ...updates },
        },
      })
    );
  };

  const toraxData: Torax = medicalEvaluation.torax ?? {
    deformacionesObs: "",
    cicatricesObs: "",
  };
  const handleToraxChange = (field: keyof Torax, value: "si" | "no" | string | undefined) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          torax: { ...toraxData, [field]: value },
        },
      })
    );
  };

  const resp: Respiratorio = medicalEvaluation.respiratorio ?? {
    sinAlteraciones: undefined,
  };
  const handleRespChange = (
    field: keyof Respiratorio,
    value: boolean | string | undefined
  ) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          respiratorio: { ...resp, [field]: value },
        },
      })
    );
  };
  const handleRespBatchChange = (updates: Partial<Respiratorio>) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          respiratorio: { ...resp, ...updates },
        },
      })
    );
  };

  const osteo: Osteoarticular = medicalEvaluation.osteoarticular ?? {
    mmssObs: "",
    mmiiObs: "",
    columnaObs: "",
    amputacionesObs: "",
  };

  const handleOsteoChange = (
    field: keyof Osteoarticular,
    value: boolean | string | undefined
  ) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          osteoarticular: {
            ...osteo,
            [field]: value,
          },
        },
      })
    );
  };

  const genito: Genitourinario = medicalEvaluation.genitourinario ?? {
    observaciones: "",
    varicoceleObs: "",
  };

  const handleGenitoChange = (
    field: keyof Genitourinario,
    value: boolean | string | undefined
  ) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          genitourinario: { ...genito, [field]: value },
        },
      })
    );
  };
  const handleGenitoBatchChange = (updates: Partial<Genitourinario>) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          genitourinario: { ...genito, ...updates },
        },
      })
    );
  };

  const gi: Gastrointestinal = medicalEvaluation.gastrointestinal ?? {
    observaciones: "",
  };

  const handleGIChange = (
    field: keyof Gastrointestinal,
    value: boolean | string | undefined
  ) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          gastrointestinal: {
            ...gi,
            [field]: value,
          },
        },
      })
    );
  };

  const handleGIBatchChange = (updates: Partial<Gastrointestinal>) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          gastrointestinal: { ...gi, ...updates },
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
  const withoutCorr = {
    right: medicalEvaluation.agudezaSc?.right ?? "",
    left: medicalEvaluation.agudezaSc?.left ?? "",
  };
  const withCorr = {
    right: medicalEvaluation.agudezaCc?.right ?? "",
    left: medicalEvaluation.agudezaCc?.left ?? "",
  };
  const chromatic = medicalEvaluation.visionCromatica ?? "normal";
  const notes = medicalEvaluation.notasVision ?? "";

  const handleChromaticChange = (val: "normal" | "anormal") => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          visionCromatica: val,
        },
      })
    );
  };

  const handleNotesChange = (txt: string) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          notasVision: txt,
        },
      })
    );
  };

  const cabezaData: CabezaCuello = medicalEvaluation.cabezaCuello ?? {
    sinAlteraciones: undefined,
    observaciones: "",
  };
  const handleCabezaChange = (
    field: keyof CabezaCuello,
    value: boolean | string | undefined
  ) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          cabezaCuello: { ...cabezaData, [field]: value },
        },
      })
    );
  };
  const handleCabezaBatchChange = (updates: Partial<CabezaCuello>) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          cabezaCuello: { ...cabezaData, ...updates },
        },
      })
    );
  };

  const neu: Neurologico = medicalEvaluation.neurologico ?? {
    observaciones: "",
  };

const handleNeuChange = (
    field: keyof Neurologico,
    value: boolean | string | undefined
  ) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          neurologico: {
            ...neu,
            [field]: value,
          },
        },
      })
    );
  };
  const handleNeuBatchChange = (updates: Partial<Neurologico>) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          neurologico: { ...neu, ...updates },
        },
      })
    );
  };

  const bucodental: Bucodental = medicalEvaluation.bucodental ?? {
    sinAlteraciones: undefined,
    caries: undefined,
    faltanPiezas: undefined,
    observaciones: "",
  };
  const handleBucodentalChange = (
    field: keyof Bucodental,
    value: boolean | string | undefined
  ) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          bucodental: { ...bucodental, [field]: value },
        },
      })
    );
  };
  const handleBucodentalBatchChange = (updates: Partial<Bucodental>) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          bucodental: { ...bucodental, ...updates },
        },
      })
    );
  };

  const pielData: Piel = medicalEvaluation.piel ?? {
    observaciones: "",
  };
  const handlePielChange = (field: keyof Piel, value: "si" | "no" | string | undefined) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          piel: { ...pielData, [field]: value },
        },
      })
    );
  };

  // Actualizar agudeza sin corrección
  const handleScChange = (eye: "right" | "left", value: string) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          agudezaSc: {
            ...medicalEvaluation.agudezaSc,
            [eye]: value,
          },
        },
      })
    );
  };

  // Actualizar agudeza con corrección
  const handleCcChange = (eye: "right" | "left", value: string) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          agudezaCc: {
            ...medicalEvaluation.agudezaCc,
            [eye]: value,
          },
        },
      })
    );
  };

  const sectionCardClass =
    "rounded-lg border border-slate-200 bg-slate-50/60 p-4";
  const sections = [
    { key: "clinical" as const, label: "Clínico" },
    { key: "visual" as const, label: "Visual" },
    { key: "skin" as const, label: "Piel" },
    { key: "head-neck" as const, label: "Cabeza y cuello" },
    { key: "oral" as const, label: "Bucodental" },
    { key: "thorax" as const, label: "Tórax" },
    { key: "respiratory" as const, label: "Respiratorio" },
    { key: "circulatory" as const, label: "Circulatorio" },
    { key: "neurological" as const, label: "Neurológico" },
    { key: "gastrointestinal" as const, label: "Gastro" },
    { key: "genitourinary" as const, label: "Genitourinario" },
    { key: "osteoarticular" as const, label: "Osteoarticular" },
  ];

  const content = (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <Button
            key={section.key}
            type="button"
            variant="outline"
            size="sm"
            className={
              activeSection === section.key
                ? "border-greenPrimary/20 bg-greenPrimary/5 text-greenPrimary"
                : "border-slate-200 bg-white text-slate-700 hover:border-greenPrimary/30 hover:bg-greenPrimary/5 hover:text-greenPrimary"
            }
            onClick={() => setActiveSection(section.key)}
          >
            {section.label}
          </Button>
        ))}
      </div>

      {activeSection === "clinical" && (
        <div className="grid gap-4">
          <ClinicalBlock
            title="Aspecto general"
            description="Elegí una valoración general rápida del colaborador."
          >
            <AspectoGeneralCheckboxes
              isEditing={isEditing}
              medicalEvaluation={medicalEvaluation}
              handleAspectoGeneralChange={handleAspectoGeneralChange}
            />
          </ClinicalBlock>
          <ClinicalBlock
            title="Mediciones clínicas"
            description="Cargá las medidas básicas que después también se reflejan en el informe."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="talla" className="text-sm font-medium text-slate-700">
                  Talla
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="talla"
                    value={medicalEvaluation.examenClinico.talla || ""}
                    onChange={(e) =>
                      handleExamenClinicoChange("talla", e.target.value)
                    }
                    disabled={!isEditing}
                    className="bg-white"
                  />
                  <span className="text-sm text-slate-500">cm</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="peso" className="text-sm font-medium text-slate-700">
                  Peso
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="peso"
                    value={medicalEvaluation.examenClinico.peso || ""}
                    onChange={(e) =>
                      handleExamenClinicoChange("peso", e.target.value)
                    }
                    disabled={!isEditing}
                    className="bg-white"
                  />
                  <span className="text-sm text-slate-500">kg</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imc" className="text-sm font-medium text-slate-700">
                  IMC
                </Label>
                <div
                  className="rounded-md border border-greenPrimary/12 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  id="imc"
                >
                  {computeImc()}
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="perimetro-abdominal"
                  className="text-sm font-medium text-slate-700"
                >
                  Perímetro abdominal
                </Label>
                <div className="flex items-center gap-2">
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
                    disabled={!isEditing}
                    className="bg-white"
                  />
                  <span className="text-sm text-slate-500">cm</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="frecuencia-cardiaca-clinica"
                  className="text-sm font-medium text-slate-700"
                >
                  Frecuencia cardíaca
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="frecuencia-cardiaca-clinica"
                    value={
                      medicalEvaluation.examenClinico.frecuenciaCardiaca || ""
                    }
                    onChange={(e) =>
                      handleExamenClinicoChange(
                        "frecuenciaCardiaca",
                        e.target.value
                      )
                    }
                    disabled={!isEditing}
                    className="bg-white"
                  />
                  <span className="text-sm text-slate-500">x min</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="frecuencia-respiratoria-clinica"
                  className="text-sm font-medium text-slate-700"
                >
                  Frecuencia respiratoria
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="frecuencia-respiratoria-clinica"
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
                    disabled={!isEditing}
                    className="bg-white"
                  />
                  <span className="text-sm text-slate-500">x min</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="presion-sistolica"
                  className="text-sm font-medium text-slate-700"
                >
                  Presión sistólica
                </Label>
                <div className="flex items-center gap-2">
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
                    disabled={!isEditing}
                    className="bg-white"
                  />
                  <span className="text-sm text-slate-500">mmHg</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="presion-diastolica"
                  className="text-sm font-medium text-slate-700"
                >
                  Presión diastólica
                </Label>
                <div className="flex items-center gap-2">
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
                    disabled={!isEditing}
                    className="bg-white"
                  />
                  <span className="text-sm text-slate-500">mmHg</span>
                </div>
              </div>
            </div>
          </ClinicalBlock>
        </div>
      )}

      {activeSection === "visual" && (
        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <VisualAcuityCard
              withoutCorrection={withoutCorr}
              withCorrection={withCorr}
              chromaticVision={chromatic}
              isEditing={isEditing}
              onScChange={handleScChange}
              onCcChange={handleCcChange}
              onChromaticVisionChange={handleChromaticChange}
              notes={notes}
              onNotesChange={handleNotesChange}
            />
          </div>
        </div>
      )}

      {activeSection === "skin" && (
        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <PielSection
              isEditing={isEditing}
              data={pielData}
              onChange={handlePielChange}
            />
          </div>
        </div>
      )}

      {activeSection === "head-neck" && (
        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <CabezaCuelloSection
              isEditing={isEditing}
              data={cabezaData}
              onChange={handleCabezaChange}
              onBatchChange={handleCabezaBatchChange}
            />
          </div>
        </div>
      )}

      {activeSection === "oral" && (
        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <BucodentalSection
              isEditing={isEditing}
              data={bucodental}
              onChange={handleBucodentalChange}
              onBatchChange={handleBucodentalBatchChange}
            />
          </div>
        </div>
      )}

      {activeSection === "thorax" && (
        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <ToraxSection
              isEditing={isEditing}
              data={toraxData}
              onChange={handleToraxChange}
            />
          </div>
        </div>
      )}

      {activeSection === "respiratory" && (
        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <RespiratorioSection
              isEditing={isEditing}
              data={resp}
              onChange={handleRespChange}
              onBatchChange={handleRespBatchChange}
            />
          </div>
        </div>
      )}

      {activeSection === "circulatory" && (
        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <CirculatorioSection
              isEditing={isEditing}
              data={circulatorio}
              onChange={handleCirculatorioChange}
              onBatchChange={handleCirculatorioBatchChange}
            />
          </div>
        </div>
      )}

      {activeSection === "neurological" && (
        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <NeurologicoSection
              isEditing={isEditing}
              data={neu}
              onChange={handleNeuChange}
              onBatchChange={handleNeuBatchChange}
            />
          </div>
        </div>
      )}

      {activeSection === "gastrointestinal" && (
        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <GastrointestinalSection
              isEditing={isEditing}
              data={gi}
              onChange={handleGIChange}
              onBatchChange={handleGIBatchChange}
            />
          </div>
        </div>
      )}

      {activeSection === "genitourinary" && (
        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <GenitourinarioSection
              isEditing={isEditing}
              data={genito}
              pdfVisibilityMode={
                reportVisibilityOverrides.genitourinary_gyn_ob ?? "automatic"
              }
              onChange={handleGenitoChange}
              onBatchChange={handleGenitoBatchChange}
              onPdfVisibilityModeChange={(mode) =>
                dispatch(
                  setReportVisibilityOverride({
                    sectionKey: "genitourinary_gyn_ob",
                    mode,
                  })
                )
              }
            />
          </div>
        </div>
      )}

      {activeSection === "osteoarticular" && (
        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <OsteoarticularSection
              isEditing={isEditing}
              data={osteo}
              onChange={handleOsteoChange}
            />
          </div>
        </div>
      )}
    </div>
  );

  if (standalone) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {content}
      </div>
    );
  }

  return (
    <AccordionItem
      value="medical-evaluation"
      className="rounded-lg border border-slate-200 bg-white"
    >
      <AccordionTrigger className="px-4 text-base font-semibold text-greenPrimary">
        Evaluación Médica
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">{content}</AccordionContent>
    </AccordionItem>
  );
}
