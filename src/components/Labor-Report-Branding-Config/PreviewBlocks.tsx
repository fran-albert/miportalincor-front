import { Building2, FileBadge2, Signature, Stethoscope } from "lucide-react";
import HeaderPreviewHtml from "@/components/Pre-Occupational/Preview/Header";
import { Badge } from "@/components/ui/badge";
import {
  LaborReportBrandingConfig,
  LaborReportSignaturePresentationMode,
  LaborReportSignerDisplay,
  UpsertLaborReportSignerInput,
} from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";
import {
  getPresentationModeForSection,
  getInstitutionalSignerForSection,
  resolveStampTextLines,
  usesExamDoctorSignature,
} from "@/components/Pre-Occupational/Preview/signature-policy";

const sampleExamDoctor: LaborReportSignerDisplay = {
  name: "Médico/a del examen",
  license: "Matrícula del médico asignado",
  specialty: "Firma tomada desde el examen",
  signatureUrl: "",
  sealUrl: null,
  stampText:
    "Médico/a del examen\nFirma tomada desde el examen\nMatrícula del médico asignado",
};

function SignatureStampPreview({
  signer,
  presentationMode,
  placeholder,
}: {
  signer: LaborReportSignerDisplay;
  presentationMode: LaborReportSignaturePresentationMode;
  placeholder?: string;
}) {
  const hasSignature =
    presentationMode !== "text_only" && Boolean(signer.signatureUrl);
  const showSeal =
    presentationMode === "signature_seal_and_text" && Boolean(signer.sealUrl);
  const stampLines = resolveStampTextLines({
    stampText: signer.stampText,
    name: signer.name,
    specialty: signer.specialty,
    license: signer.license,
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="relative mb-2 h-16 overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white">
        {hasSignature ? (
          <>
            <img
              src={signer.signatureUrl}
              alt={`Firma ${signer.name}`}
              className="absolute left-3 top-2 h-10 w-28 object-contain"
            />
            {showSeal && (
              <img
                src={signer.sealUrl!}
                alt={`Sello ${signer.name}`}
                className="absolute bottom-1 left-20 h-12 w-12 object-contain opacity-90"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-slate-500">
            {placeholder || "La firma se tomará dinámicamente según la política activa."}
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        {stampLines.map((line, index) => (
          <p
            key={`${line}-${index}`}
            className={
              index === 0
                ? "text-sm font-medium leading-tight text-slate-900"
                : "text-[11px] leading-tight text-slate-600"
            }
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

export function BrandingHeaderPreview({
  config,
}: {
  config: LaborReportBrandingConfig;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-slate-500" />
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Vista previa del encabezado
          </p>
          <p className="text-xs text-slate-500">
            Así se ve la cabecera del informe para el cliente.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <HeaderPreviewHtml
          examType="Preocupacional"
          evaluationType="Informe de medicina laboral"
          brandingConfig={config}
        />

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Texto legal de pie
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {config.footerLegalText?.trim() ||
              "Todavía no hay texto legal configurado para este informe."}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SignerVisualPreview({
  signer,
}: {
  signer: UpsertLaborReportSignerInput;
}) {
  const previewSigner: LaborReportSignerDisplay = {
    name: signer.name || "Firmante sin nombre",
    specialty: signer.specialty?.trim() || "Sin especialidad cargada",
    license: signer.license?.trim() || "Sin matrícula cargada",
    signatureUrl: signer.signatureUrl?.trim() || "",
    sealUrl: signer.sealUrl?.trim() || null,
    stampText: signer.stampText?.trim() || null,
  };
  const previewMode: LaborReportSignaturePresentationMode = previewSigner.sealUrl
    ? "signature_seal_and_text"
    : "signature_and_text";

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2">
        <Signature className="h-4 w-4 text-slate-500" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Vista rápida</p>
          <p className="text-xs text-slate-500">
            El cliente verá la firma y el sello de esta forma.
          </p>
        </div>
      </div>

      <SignatureStampPreview
        signer={previewSigner}
        presentationMode={previewMode}
        placeholder="Cargá la URL de firma para ver la firma institucional en contexto."
      />
    </div>
  );
}

export function PolicyPreviewList({
  config,
  reportType,
  previewExamDoctor,
  previewExamDoctorLabel,
  isPreviewDoctorLoading = false,
}: {
  config: LaborReportBrandingConfig;
  reportType: string;
  previewExamDoctor?: LaborReportSignerDisplay;
  previewExamDoctorLabel?: string | null;
  isPreviewDoctorLoading?: boolean;
}) {
  const sections = [
    {
      key: "cover" as const,
      title: "Portada y cierre",
      icon: FileBadge2,
      dynamicMessage:
        "Usa siempre el firmante institucional definido para portada y cierre.",
    },
    {
      key: "clinical" as const,
      title: "Páginas clínicas",
      icon: Stethoscope,
      dynamicMessage:
        "La firma se toma del médico asignado al examen que se está generando.",
    },
    {
      key: "studies" as const,
      title: "Complementarios",
      icon: Signature,
      dynamicMessage:
        "Usa el firmante institucional definido para los estudios adjuntos.",
    },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2">
        <FileBadge2 className="h-4 w-4 text-slate-500" />
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Cómo firma hoy el informe
          </p>
          <p className="text-xs text-slate-500">
            Vista rápida por sección para que no dependa de IDs o referencias técnicas.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const usesExamDoctor = usesExamDoctorSignature(
            section.key,
            config,
            reportType
          );
          const presentationMode = getPresentationModeForSection(
            section.key,
            config,
            reportType
          );
          const signer = usesExamDoctor
            ? previewExamDoctor ?? sampleExamDoctor
            : getInstitutionalSignerForSection(section.key, config, reportType);

          return (
            <div
              key={section.key}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {section.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {usesExamDoctor
                        ? previewExamDoctorLabel
                          ? `Vista previa usando ${previewExamDoctorLabel}.`
                          : section.dynamicMessage
                        : "Usa el firmante institucional elegido para esta sección."}
                    </p>
                  </div>
                </div>
                <Badge variant={usesExamDoctor ? "warning" : "success"}>
                  {usesExamDoctor ? "Médico del examen" : "Firmante institucional"}
                </Badge>
              </div>

              {usesExamDoctor && isPreviewDoctorLoading && (
                <p className="mb-3 text-xs text-slate-500">
                  Cargando firma y texto profesional del médico seleccionado...
                </p>
              )}

              <SignatureStampPreview
                signer={signer}
                presentationMode={presentationMode}
                placeholder="La firma y el sello se resolverán desde el médico asignado al examen."
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
