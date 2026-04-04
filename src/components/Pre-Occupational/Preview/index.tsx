import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Save } from "lucide-react";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { pdf } from "@react-pdf/renderer";
import { MedicalEvaluation } from "@/types/Medical-Evaluation/MedicalEvaluation";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PdfLoadingOverlay from "@/components/Pdf/Overlay";
import PDFDocument from "./Pdf/Document";
import View from "./View";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { GetUrlsResponseDto } from "@/api/Study/Collaborator/get-all-studies-images-urls.collaborators.action";
import { fetchImageAsDataUrl } from "@/api/Study/Collaborator/get-proxy-url.action";
import { useDoctorWithSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { useUploadStudyWithProgress } from "@/hooks/Study/useUploadStudyWithProgress";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { Card, CardContent } from "@/components/ui/card";
import { ReportStatusBadge } from "@/components/Pre-Occupational/Report-Versioning/report-status";
import { useCurrentMedicalEvaluationReport } from "@/hooks/Medical-Evaluation-Report-Version/useCurrentMedicalEvaluationReport";
import { RootState } from "@/store/store";
import { useLaborReportBrandingConfig } from "@/hooks/Labor-Report-Branding-Config/useLaborReportBrandingConfig";
import { useDoctors } from "@/hooks/Doctor/useDoctors";

interface Props {
  collaborator: Collaborator;
  urls: GetUrlsResponseDto[] | undefined;
  medicalEvaluation: MedicalEvaluation;
  dataValues: DataValue[] | undefined;
}

export default function PreOccupationalPreviewComponent({
  collaborator,
  urls,
  medicalEvaluation,
  dataValues,
}: Props) {
  const reportVisibilityOverrides = useSelector(
    (state: RootState) => state.preOccupational.reportVisibilityOverrides
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const pdfBlobRef = useRef<Blob | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showError } = useToastContext();
  const {
    currentVersion,
    currentUrl,
    hasReport,
    hasLegacyCurrentReport,
  } = useCurrentMedicalEvaluationReport({
    auth: true,
    collaboratorId: collaborator.id,
    medicalEvaluationId: medicalEvaluation.id,
  });
  const doctorQueryId = medicalEvaluation.doctorId
    ? String(medicalEvaluation.doctorId)
    : "";
  const { data: brandingConfig } = useLaborReportBrandingConfig();
  const { doctors } = useDoctors({ auth: true, fetchDoctors: true });
  const examsHref = `/incor-laboral/colaboradores/${collaborator.slug}/examenes`;
  const examHref = `/incor-laboral/colaboradores/${collaborator.slug}/examen/${medicalEvaluation.id}`;
  const previewHref = `${examHref}/previsualizar-informe`;
  const matchedDoctor = doctors.find(
    (doctor) => String(doctor.userId) === doctorQueryId
  );

  const { upload, cancel } = useUploadStudyWithProgress({
    collaboratorId: collaborator.id,
    onProgress: (progressValue, message) => {
      setProgress(progressValue);
      setStatusMessage(message);
    },
    onSuccess: async () => {
      // Invalidar queries
      await queryClient.invalidateQueries({
        queryKey: ["collaborator-medical-evaluation", { id: collaborator.id }],
      });

      await queryClient.refetchQueries({
        queryKey: ["collaborator-medical-evaluation", { id: collaborator.id }],
      });
      await queryClient.invalidateQueries({
        queryKey: ["medical-evaluation-report-versions", medicalEvaluation.id],
      });

      // Descargar el PDF
      if (pdfBlobRef.current) {
        const url = window.URL.createObjectURL(pdfBlobRef.current);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${collaborator.firstName}_${collaborator.lastName}_${medicalEvaluation.evaluationType.name}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      setIsGenerating(false);
      setProgress(0);
      setStatusMessage("");
      navigate(`/incor-laboral/colaboradores/${collaborator.slug}`);
    },
    onError: (error) => {
      setIsGenerating(false);
      setProgress(0);
      setStatusMessage("");
      showError("Error", error);
    },
  });

  const {
    data,
    isLoading,
    isError,
    error,
  } = useDoctorWithSignatures({
    id: doctorQueryId,
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Colaboradores", href: "/incor-laboral/colaboradores" },
    {
      label: collaborator
        ? `${collaborator.firstName} ${collaborator.lastName}`
        : "Incor Laboral",
      href: `/incor-laboral/colaboradores/${collaborator?.slug}`,
    },
    {
      label: "Exámenes Médicos",
      href: examsHref,
    },
    {
      label: medicalEvaluation.evaluationType.name,
      href: examHref,
    },
    {
      label: "Previsualizar informe",
      href: previewHref,
    },
  ];

  if (isError) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "No pudimos obtener la firma y el sello del médico.";

    return (
      <div className="mt-4 space-y-4">
        <BreadcrumbComponent items={breadcrumbItems} />
        <Card className="border-red-200 bg-red-50">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-red-900">
                No pudimos preparar la regeneración del informe
              </h2>
              <p className="text-sm leading-6 text-red-900/90">
                El examen tiene asignado un médico que no existe o no puede
                resolverse en Historia Clínica. Por eso no podemos volver a
                generar el PDF firmado.
              </p>
              <p className="text-sm leading-6 text-red-900/80">
                Detalle: {errorMessage}
              </p>
              {doctorQueryId ? (
                <div className="space-y-1 text-sm leading-6 text-red-900/80">
                  <p>Médico asignado en este examen: `doctorId {doctorQueryId}`</p>
                  <p>
                    {matchedDoctor
                      ? `HC hoy sí tiene un médico con ese userId: ${matchedDoctor.lastName}, ${matchedDoctor.firstName}.`
                      : `HC hoy no devuelve ningún médico con userId ${doctorQueryId}.`}
                  </p>
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate(examHref)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al examen
              </Button>
              {hasReport && currentUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 bg-white text-red-900 hover:bg-red-100"
                  onClick={() =>
                    window.open(currentUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Ver informe actual
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center p-6">
        <p className="text-gray-500">Cargando datos del doctor...</p>
      </div>
    );
  }

  if (!doctorQueryId) {
    return (
      <div className="mt-4 space-y-4">
        <BreadcrumbComponent items={breadcrumbItems} />
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-yellow-900">
                Este examen no tiene médico asignado
              </h2>
              <p className="text-sm leading-6 text-yellow-900/90">
                No podemos generar ni previsualizar el informe porque falta el
                médico firmante del examen. Esto suele pasar con registros
                viejos creados antes de que el sistema pidiera doctor.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate(examHref)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al examen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCancel = () => {
    cancel();
    setIsGenerating(false);
    setProgress(0);
    setStatusMessage("");
  };

  const handleSaveAndGeneratePdf = async () => {
    setIsGenerating(true);
    setProgress(5);
    setStatusMessage("Preparando imágenes...");

    try {
      // Convertir URLs a DataURLs para el PDF
      const dataUrls = await Promise.all(
        urls!.map((u) => fetchImageAsDataUrl(u.url))
      );

      setProgress(10);
      setStatusMessage("Generando PDF...");

      const studiesWithDataUrls = urls!.map((u, i) => ({
        ...u,
        url: dataUrls[i],
      }));

      const MyPDFContent = (
        <PDFDocument
          collaborator={collaborator}
          studies={studiesWithDataUrls}
          dataValues={dataValues}
          medicalEvaluationType={medicalEvaluation.evaluationType.name}
          doctorData={data}
          brandingConfig={brandingConfig}
          reportVisibilityOverrides={reportVisibilityOverrides}
        />
      );

      const pdfBlob = await pdf(MyPDFContent).toBlob();
      pdfBlobRef.current = pdfBlob;

      setProgress(15);
      setStatusMessage("Subiendo archivo...");

      // Preparar FormData
      const fileName = `pre_occupational_preview_${collaborator.userName}.pdf`;
      const formData = new FormData();
      formData.append("file", pdfBlob, fileName);
      formData.append("userName", collaborator.userName);
      formData.append("studyType", medicalEvaluation.evaluationType.name);
      formData.append("completed", "true");
      formData.append("collaboratorId", String(collaborator.id));
      formData.append("medicalEvaluationId", String(medicalEvaluation.id));

      // Iniciar upload con progreso SSE
      await upload(formData);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      showError("Error", "Error al generar el PDF");
      setIsGenerating(false);
      setProgress(0);
      setStatusMessage("");
    }
  };
  if (urls === undefined) {
    return (
      <div className="flex justify-center items-center p-6">
        <p className="text-gray-500">Cargando estudios...</p>
      </div>
    );
  }

  // if (urls.length === 0) {
  //   return (
  //     <div className="flex justify-center items-center p-6">
  //       <p className="text-gray-500">No hay estudios subidos todavía.</p>
  //     </div>
  //   );
  // }
  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <Card className="overflow-hidden border-greenPrimary/20 bg-[linear-gradient(135deg,rgba(12,72,74,0.09)_0%,rgba(24,123,128,0.14)_22%,rgba(255,255,255,0.96)_58%,rgba(1,169,164,0.07)_100%)] shadow-[0_24px_60px_-32px_rgba(12,72,74,0.45)]">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-greenPrimary/15 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-greenSecondary shadow-sm backdrop-blur-sm">
                <FileText className="h-4 w-4" />
                Emisión del informe
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-greenSecondary">
                  Esta pantalla genera el informe actual
                </h2>
                <p className="max-w-3xl text-sm leading-6 text-slate-700">
                  {hasReport
                    ? "El PDF actual sigue disponible. Si continuás, se genera una nueva versión y pasa a ser el informe actual del examen."
                    : "Todavía no hay un informe generado. Si continuás, se crea el primer PDF del examen y queda disponible desde la tabla del colaborador."}
                </p>
              </div>
            </div>
            <ReportStatusBadge
              version={currentVersion}
              hasLegacyReport={hasLegacyCurrentReport}
            />
          </div>
        </CardContent>
      </Card>
      <View
        collaborator={collaborator}
        studies={urls}
        medicalEvaluationType={medicalEvaluation.evaluationType.name}
        dataValues={dataValues!}
        doctorData={data}
        brandingConfig={brandingConfig}
        reportVisibilityOverrides={reportVisibilityOverrides}
      />
      {isGenerating && (
        <PdfLoadingOverlay
          isGenerating={isGenerating}
          progress={progress}
          onCancel={handleCancel}
          statusMessage={statusMessage}
        />
      )}
      <div className="flex justify-center gap-6 p-6">
        <Button variant="outline" size="sm" onClick={() => navigate(examHref)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al examen
        </Button>
        {hasReport && currentUrl && (
          <Button
            variant="outline"
            size="sm"
            className="border-greenPrimary/20 bg-white/80 text-greenSecondary hover:border-greenPrimary/35 hover:bg-greenPrimary/5"
            onClick={() => window.open(currentUrl, "_blank", "noopener,noreferrer")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Ver informe actual
          </Button>
        )}
        <Button
          variant="default"
          size="sm"
          className="border border-greenPrimary/10 bg-gradient-to-r from-greenSecondary via-greenPrimary to-incor text-white shadow-[0_16px_30px_-18px_rgba(12,72,74,0.9)] hover:from-greenSecondary hover:via-greenSecondary hover:to-greenPrimary"
          onClick={handleSaveAndGeneratePdf}
          disabled={isGenerating}
        >
          <Save className="mr-2 h-4 w-4" />
          {isGenerating
            ? "Generando..."
            : hasReport
              ? "Regenerar informe actual"
              : "Generar informe"}
        </Button>
      </div>
    </div>
  );
}
