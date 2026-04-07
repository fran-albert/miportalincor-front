import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Genitourinario } from "@/store/Pre-Occupational/preOccupationalSlice";
import { ReportVisibilityMode } from "@/common/helpers/report-visibility";
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from "../FormPrimitives";

interface GenitourinarioSectionProps {
  isEditing: boolean;
  data: Genitourinario;
  pdfVisibilityMode?: ReportVisibilityMode;
  onChange: (
    field: keyof Genitourinario,
    value: boolean | string | undefined
  ) => void;
  onBatchChange?: (updates: Partial<Genitourinario>) => void;
  onPdfVisibilityModeChange?: (mode: ReportVisibilityMode) => void;
}

export const GenitourinarioSection: React.FC<GenitourinarioSectionProps> = ({
  isEditing,
  data,
  pdfVisibilityMode = "automatic",
  onChange,
  onBatchChange,
  onPdfVisibilityModeChange,
}) => {
  const includeInReport = pdfVisibilityMode !== "force_hide";
  const isAutomatic = pdfVisibilityMode === "automatic";

  const handleSinAlteracionesChange = (checked: boolean) => {
    if (checked && onBatchChange) {
      onBatchChange({
        sinAlteraciones: true,
        observaciones: '',
        varicocele: false,
        varicoceleObs: '',
      });
    } else {
      onChange("sinAlteraciones", checked);
    }
  };

  const handleObservacionesChange = (value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({ sinAlteraciones: false, observaciones: value });
    } else {
      onChange("observaciones", value);
    }
  };

  const handleVaricoceleChange = (value: boolean | undefined) => {
    if (value === true && data.sinAlteraciones && onBatchChange) {
      onBatchChange({ sinAlteraciones: false, varicocele: true });
    } else {
      onChange("varicocele", value);
    }
  };

  const handleVaricoceleObsChange = (value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({ sinAlteraciones: false, varicoceleObs: value });
    } else {
      onChange("varicoceleObs", value);
    }
  };

  // Solo las observaciones se deshabilitan, los checkboxes Sí/No siempre habilitados
  const obsDisabled = !isEditing || data.sinAlteraciones;
  const sinAlteracionesValue =
    data.sinAlteraciones === true ? "si" : data.sinAlteraciones === false ? "no" : "";
  const varicoceleValue =
    data.varicocele === true ? "si" : data.varicocele === false ? "no" : "";

  return (
    <div className="space-y-4">
      <ClinicalBlock
        title="Informe"
        description="Decidí primero si estos datos se incluyen en el PDF o si el sistema resuelve la visibilidad automáticamente."
        className="md:col-span-2"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">
              Incluir datos gineco-obstétricos en el informe
            </Label>
            <p className="text-xs leading-5 text-slate-500">
              {isAutomatic
                ? "Está usando el criterio automático del sistema."
                : "Este bloque quedó configurado manualmente para el informe."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
              <Switch
                checked={includeInReport}
                disabled={!isEditing}
                onCheckedChange={(checked) =>
                  onPdfVisibilityModeChange?.(
                    checked ? "force_show" : "force_hide"
                  )
                }
              />
              <span className="text-sm font-medium text-slate-700">
                {includeInReport ? "Incluido" : "Oculto"}
              </span>
            </div>
            {!isAutomatic && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-slate-600 hover:text-greenPrimary"
                disabled={!isEditing}
                onClick={() => onPdfVisibilityModeChange?.("automatic")}
              >
                Usar automático
              </Button>
            )}
          </div>
        </div>
      </ClinicalBlock>

      <ClinicalBlock
        title="Estado general"
        description="Marcá si el sistema está sin alteraciones o si hay hallazgos para describir."
      >
        <BooleanChoiceField
          idPrefix="gen-sin"
          label="Resultado"
          value={
            sinAlteracionesValue === "si"
              ? true
              : sinAlteracionesValue === "no"
                ? false
                : undefined
          }
          disabled={!isEditing}
          positiveLabel="Sin alteraciones"
          negativeLabel="Con hallazgos"
          onChange={(value) => handleSinAlteracionesChange(value === true)}
        />
        <NotesField
          id="gen-obs"
          label="Observaciones generales"
          value={data.observaciones}
          disabled={obsDisabled}
          onChange={handleObservacionesChange}
          placeholder={
            data.sinAlteraciones
              ? "Sin observaciones"
              : "Describí los hallazgos observados"
          }
        />
      </ClinicalBlock>

      <ClinicalBlock title="Varicocele">
        <BooleanChoiceField
          idPrefix="gen-varicocele"
          label="Presencia"
          value={
            varicoceleValue === "si"
              ? true
              : varicoceleValue === "no"
                ? false
                : undefined
          }
          disabled={!isEditing}
          onChange={handleVaricoceleChange}
        />
        <NotesField
          id="gen-varicocele-obs"
          label="Observaciones"
          value={data.varicoceleObs}
          disabled={obsDisabled}
          onChange={handleVaricoceleObsChange}
          placeholder="Detalle clínico o aclaraciones"
        />
      </ClinicalBlock>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gen-fum" className="text-sm font-medium text-slate-700">
            F.U.M
          </Label>
          <Input
            id="gen-fum"
            type="date"
            className="w-full bg-white"
            value={data.fum}
            disabled={!isEditing}
            onChange={(e) => onChange("fum", e.currentTarget.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gen-partos" className="text-sm font-medium text-slate-700">
            Partos
          </Label>
          <Input
            id="gen-partos"
            type="text"
            className="w-full bg-white"
            value={data.partos}
            disabled={!isEditing}
            onChange={(e) => onChange("partos", e.currentTarget.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gen-embarazos" className="text-sm font-medium text-slate-700">
            Embarazos
          </Label>
          <Input
            id="gen-embarazos"
            type="text"
            className="w-full bg-white"
            value={data.embarazos}
            disabled={!isEditing}
            onChange={(e) => onChange("embarazos", e.currentTarget.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gen-cesarea" className="text-sm font-medium text-slate-700">
            Cesárea
          </Label>
          <Input
            id="gen-cesarea"
            type="text"
            className="w-full bg-white"
            value={data.cesarea}
            disabled={!isEditing}
            onChange={(e) => onChange("cesarea", e.currentTarget.value)}
          />
        </div>
      </div>
    </div>
  );
};
