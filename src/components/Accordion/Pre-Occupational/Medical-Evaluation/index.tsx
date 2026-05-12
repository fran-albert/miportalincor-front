import { useSelector, useDispatch } from "react-redux";
import type { ReactNode } from "react";
import { RootState, AppDispatch } from "@/store/store";
import {
  Circulatorio,
  Gastrointestinal,
  Genitourinario,
  Neurologico,
  Osteoarticular,
  Respiratorio,
  setFormData,
  Torax,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { ClinicalBlock } from "./FormPrimitives";

interface Props {
  isEditing: boolean;
  standalone?: boolean;
}

interface EvaluationSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

function EvaluationSection({
  title,
  description,
  children,
}: EvaluationSectionProps) {
  return (
    <section className="space-y-3 border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold uppercase tracking-[0.08em] text-greenPrimary">
          {title}
        </h4>
        {description ? (
          <p className="text-xs leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function MedicalEvaluationAccordion({
  isEditing,
  standalone = false,
}: Props) {
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
    const nextCirculatorio = {
      ...circulatorio,
      [field]: value,
    };
    const nextExam =
      field === "frecuenciaCardiaca"
        ? {
            ...medicalEvaluation.examenClinico,
            frecuenciaCardiaca: value == null ? "" : String(value),
          }
        : medicalEvaluation.examenClinico;

    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          examenClinico: nextExam,
          circulatorio: nextCirculatorio,
        },
      })
    );
  };
  const handleCirculatorioBatchChange = (updates: Partial<Circulatorio>) => {
    const nextCirculatorio = { ...circulatorio, ...updates };
    const nextExam =
      updates.frecuenciaCardiaca !== undefined
        ? {
            ...medicalEvaluation.examenClinico,
            frecuenciaCardiaca:
              updates.frecuenciaCardiaca == null
                ? ""
                : String(updates.frecuenciaCardiaca),
          }
        : medicalEvaluation.examenClinico;

    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          examenClinico: nextExam,
          circulatorio: nextCirculatorio,
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
    const nextResp = { ...resp, [field]: value };
    const nextExam =
      field === "frecuenciaRespiratoria"
        ? {
            ...medicalEvaluation.examenClinico,
            frecuenciaRespiratoria: value == null ? "" : String(value),
          }
        : medicalEvaluation.examenClinico;

    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          examenClinico: nextExam,
          respiratorio: nextResp,
        },
      })
    );
  };
  const handleRespBatchChange = (updates: Partial<Respiratorio>) => {
    const nextResp = { ...resp, ...updates };
    const nextExam =
      updates.frecuenciaRespiratoria !== undefined
        ? {
            ...medicalEvaluation.examenClinico,
            frecuenciaRespiratoria:
              updates.frecuenciaRespiratoria == null
                ? ""
                : String(updates.frecuenciaRespiratoria),
          }
        : medicalEvaluation.examenClinico;

    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          examenClinico: nextExam,
          respiratorio: nextResp,
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
    const updatedResp =
      field === "frecuenciaRespiratoria"
        ? { ...resp, frecuenciaRespiratoria: value }
        : resp;
    const updatedCirculatorio =
      field === "frecuenciaCardiaca"
        ? { ...circulatorio, frecuenciaCardiaca: value }
        : circulatorio;

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
          respiratorio: updatedResp,
          circulatorio: updatedCirculatorio,
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

  const content = (
    <div className="space-y-6">
      <EvaluationSection
        title="Examen clínico"
        description="Aspecto general, mediciones y signos vitales principales."
      >
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
      </EvaluationSection>

      <EvaluationSection title="Evaluación visual">
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
      </EvaluationSection>

      <EvaluationSection title="Piel">
        <PielSection
          isEditing={isEditing}
          data={pielData}
          onChange={handlePielChange}
        />
      </EvaluationSection>

      <EvaluationSection title="Cabeza y cuello">
        <CabezaCuelloSection
          isEditing={isEditing}
          data={cabezaData}
          onChange={handleCabezaChange}
          onBatchChange={handleCabezaBatchChange}
        />
      </EvaluationSection>

      <EvaluationSection title="Bucodental">
        <BucodentalSection
          isEditing={isEditing}
          data={bucodental}
          onChange={handleBucodentalChange}
          onBatchChange={handleBucodentalBatchChange}
        />
      </EvaluationSection>

      <EvaluationSection title="Tórax">
        <ToraxSection
          isEditing={isEditing}
          data={toraxData}
          onChange={handleToraxChange}
        />
      </EvaluationSection>

      <EvaluationSection title="Aparato respiratorio">
        <RespiratorioSection
          isEditing={isEditing}
          data={resp}
          onChange={handleRespChange}
          onBatchChange={handleRespBatchChange}
        />
      </EvaluationSection>

      <EvaluationSection title="Aparato circulatorio">
        <CirculatorioSection
          isEditing={isEditing}
          data={circulatorio}
          onChange={handleCirculatorioChange}
          onBatchChange={handleCirculatorioBatchChange}
        />
      </EvaluationSection>

      <EvaluationSection title="Aparato neurológico">
        <NeurologicoSection
          isEditing={isEditing}
          data={neu}
          onChange={handleNeuChange}
          onBatchChange={handleNeuBatchChange}
        />
      </EvaluationSection>

      <EvaluationSection title="Aparato gastrointestinal">
        <GastrointestinalSection
          isEditing={isEditing}
          data={gi}
          onChange={handleGIChange}
          onBatchChange={handleGIBatchChange}
        />
      </EvaluationSection>

      <EvaluationSection title="Aparato genitourinario">
        <GenitourinarioSection
          isEditing={isEditing}
          data={genito}
          onChange={handleGenitoChange}
          onBatchChange={handleGenitoBatchChange}
        />
      </EvaluationSection>

      <EvaluationSection title="Sistema osteoarticular">
        <OsteoarticularSection
          isEditing={isEditing}
          data={osteo}
          onChange={handleOsteoChange}
        />
      </EvaluationSection>
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
      className="border-slate-200 bg-white last:border-b-0"
    >
      <AccordionTrigger className="px-4 text-base font-semibold text-greenPrimary">
        Evaluación médica
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">{content}</AccordionContent>
    </AccordionItem>
  );
}
