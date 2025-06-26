import { useSelector, useDispatch } from "react-redux";
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
import { DataValue } from "@/types/Data-Value/Data-Value";
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
    sinAlteraciones: false,
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

  const toraxData: Torax = medicalEvaluation.torax ?? {
    deformacionesObs: "",
    cicatricesObs: "",
  };
  const handleToraxChange = (field: keyof Torax, value: boolean | string) => {
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
    sinAlteraciones: false,
  };
  const handleRespChange = (
    field: keyof Respiratorio,
    value: boolean | string
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

  const osteo: Osteoarticular = medicalEvaluation.osteoarticular ?? {
    mmssObs: "",
    mmiiObs: "",
    columnaObs: "",
    amputacionesObs: "",
  };

  const handleOsteoChange = (
    field: keyof Osteoarticular,
    value: boolean | string
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
    right: medicalEvaluation.agudezaSc?.right ?? "10/10",
    left: medicalEvaluation.agudezaSc?.left ?? "10/10",
  };
  const withCorr = {
    right: medicalEvaluation.agudezaCc?.right ?? "10/10",
    left: medicalEvaluation.agudezaCc?.left ?? "10/10",
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
    sinAlteraciones: false,
    observaciones: "",
  };
  const handleCabezaChange = (
    field: keyof CabezaCuello,
    value: boolean | string
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

  const neu: Neurologico = medicalEvaluation.neurologico ?? {
    observaciones: "",
  };

  const handleNeuChange = (
    field: keyof Neurologico,
    value: boolean | string
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

  const bucodental: Bucodental = medicalEvaluation.bucodental ?? {
    sinAlteraciones: false,
    caries: false,
    faltanPiezas: false,
    observaciones: "",
  };
  const handleBucodentalChange = (
    field: keyof Bucodental,
    value: boolean | string
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

  const pielData: Piel = medicalEvaluation.piel ?? {
    observaciones: "",
  };
  const handlePielChange = (field: keyof Piel, value: "si" | "no" | string) => {
    dispatch(
      setFormData({
        medicalEvaluation: {
          ...medicalEvaluation,
          piel: { ...pielData, [field]: value },
        },
      })
    );
  };

  return (
    <AccordionItem value="medical-evaluation" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Evaluación Médica
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-6">
          {/* Aspecto general */}
          <AspectoGeneralCheckboxes
            isEditing={isEditing}
            medicalEvaluation={medicalEvaluation}
            handleAspectoGeneralChange={handleAspectoGeneralChange}
          />
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
                    disabled
                    className="disabled:opacity-50"
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
                    disabled
                    className="disabled:opacity-50"
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
          <VisualAcuityCard
            withoutCorrection={withoutCorr}
            withCorrection={withCorr}
            chromaticVision={chromatic}
            onChromaticVisionChange={handleChromaticChange}
            notes={notes}
            onNotesChange={handleNotesChange}
          />
          <div className="space-y-4">
            <PielSection
              isEditing={isEditing}
              data={pielData}
              onChange={handlePielChange}
            />
          </div>
          <div className="space-y-6">
            <CabezaCuelloSection
              isEditing={isEditing}
              data={cabezaData}
              onChange={handleCabezaChange}
            />
            <BucodentalSection
              isEditing={isEditing}
              data={bucodental}
              onChange={handleBucodentalChange}
            />
            <ToraxSection
              isEditing={isEditing}
              data={toraxData}
              onChange={handleToraxChange}
            />
          </div>
          <RespiratorioSection
            isEditing={isEditing}
            data={resp}
            onChange={handleRespChange}
          />
          <CirculatorioSection
            isEditing={isEditing}
            data={circulatorio}
            onChange={handleCirculatorioChange}
          />
          <NeurologicoSection
            isEditing={isEditing}
            data={neu}
            onChange={handleNeuChange}
          />
          <GastrointestinalSection
            isEditing={isEditing}
            data={gi}
            onChange={handleGIChange}
          />
          <GenitourinarioSection
            isEditing={isEditing}
            data={genito}
            onChange={handleGenitoChange}
          />
          <OsteoarticularSection
            isEditing={isEditing}
            data={osteo}
            onChange={handleOsteoChange}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
