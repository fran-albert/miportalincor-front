import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Calendar,
  Eye,
  Building2,
  ExternalLink,
  Download,
  X,
  FlaskConical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { StudiesWithURL } from "@/types/Study/Study";
import { getStudiesWithUrls } from "@/api/Study/get-studies-with-urls.action";
import ExternalStudyDialog from "../Upload/external-study-dialog";
import DeleteStudyDialog from "../Delete/dialog";
import useUserRole from "@/hooks/useRoles";
import LabCard from "@/components/Laboratories/Card/card";
import { useBlodTest } from "@/hooks/Blod-Test/useBlodTest";
import { useBloodTestData } from "@/hooks/Blod-Test-Data/useBlodTestData";
import { DialogTrigger } from "@/components/ui/dialog";

type UserData = Patient | Doctor;

interface StudiesSectionProps {
  userData: UserData;
  userType?: "patient" | "doctor";
  readOnly?: boolean;
  showEditActions?: boolean;
}

const StudiesSection: React.FC<StudiesSectionProps> = ({
  userData,
  userType = "patient",
  readOnly = false,
  showEditActions = true,
}) => {
  const navigate = useNavigate();
  const { isDoctor, session } = useUserRole();
  const currentDoctorId = isDoctor ? session?.id : undefined;
  const [selectedStudy, setSelectedStudy] = useState<StudiesWithURL | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [labsDialogOpen, setLabsDialogOpen] = useState(false);

  // Fetch studies with signed URLs
  const { data: studiesByUserId = [], isLoading } = useQuery({
    queryKey: ["studies-with-urls", userData?.userId],
    queryFn: () => getStudiesWithUrls(userData?.userId || 0),
    enabled: !!userData?.userId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Obtener datos de laboratorios (solo cuando el dialog está abierto para optimizar)
  const studyIds = studiesByUserId.map((study) => String(study.id));
  const { blodTests: bloodTests = [] } = useBlodTest({ auth: true });
  const { bloodTestsData = [] } = useBloodTestData({
    auth: true,
    idStudies: studyIds,
  });

  if (!userData) return null;

  const handleNavigateToStudies = () => {
    const basePath = userType === "doctor" ? "medicos" : "pacientes";
    navigate(`/${basePath}/${userData.slug}/estudios`);
  };

  const handleViewStudy = (study: StudiesWithURL) => {
    setSelectedStudy(study);
    setIsViewModalOpen(true);
  };

  const handleOpenInNewTab = () => {
    if (selectedStudy?.signedUrl) {
      window.open(selectedStudy.signedUrl, "_blank");
    }
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedStudy(null);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get the most recent 5 studies (ordenados del más viejo al más nuevo)
  const recentStudies = studiesByUserId
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const renderStudies = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-greenPrimary border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!studiesByUserId || studiesByUserId.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin estudios registrados
          </h3>
          <p className="text-sm text-gray-500">
            {showEditActions && !readOnly
              ? "Haz clic en el botón para agregar un estudio"
              : "No hay estudios médicos para este usuario"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {recentStudies.map((study) => (
          <div
            key={study.id}
            className={`border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-greenPrimary/50 transition-all duration-200 bg-white ${
              study.isExternal
                ? "border-l-4 border-l-orange-500"
                : "border-l-4 border-l-greenPrimary"
            }`}
            onClick={() => handleViewStudy(study)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {study.studyType?.name || "Estudio"}
                  </p>
                  {study.isExternal && (
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                    >
                      <Building2 className="h-3 w-3 mr-1" />
                      Externo
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(study.date)}</span>
                </div>
                {study.isExternal && study.externalInstitution && (
                  <p className="text-xs text-orange-600 mt-1 truncate">
                    {study.externalInstitution}
                  </p>
                )}
                {study.note && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                    {study.note}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0 hover:bg-greenPrimary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewStudy(study);
                }}
              >
                <Eye className="h-4 w-4 text-greenPrimary" />
              </Button>
            </div>
          </div>
        ))}

        {/* Show "Ver más" link if there are more than 5 studies */}
        {studiesByUserId.length > 5 && (
          <Button
            variant="ghost"
            className="w-full text-greenPrimary hover:bg-greenPrimary/10"
            onClick={handleNavigateToStudies}
          >
            Ver todos los estudios ({studiesByUserId.length})
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
      <Card className="lg:col-span-1 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-greenPrimary to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle
                className="cursor-pointer hover:opacity-80 transition-opacity underline decoration-white/40 decoration-2 underline-offset-4"
                onClick={handleNavigateToStudies}
              >
                Estudios Médicos
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {studiesByUserId && studiesByUserId.length > 0 && (
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full whitespace-nowrap">
                  {studiesByUserId.length} {studiesByUserId.length !== 1 ? "estudios" : "estudio"}
                </span>
              )}
              {/* Solo médicos pueden agregar estudios externos desde Historia Clínica */}
              {showEditActions && !readOnly && userData?.userId && isDoctor && (
                <div className="flex items-center gap-2">
                  {/* Botón Tabla Laboratorios */}
                  <Dialog open={labsDialogOpen} onOpenChange={setLabsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-white/20 text-white border border-white/60 hover:bg-white/30"
                      >
                        <FlaskConical className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Laboratorios</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FlaskConical className="h-5 w-5 text-greenPrimary" />
                          Tabla de Laboratorios
                        </DialogTitle>
                      </DialogHeader>
                      <LabCard
                        studiesByUserId={[]}
                        bloodTests={bloodTests}
                        bloodTestsData={bloodTestsData}
                        role="Doctor"
                        idUser={userData.userId}
                      />
                    </DialogContent>
                  </Dialog>

                  {/* Botón Estudio Externo */}
                  <ExternalStudyDialog idUser={userData.userId} />
                </div>
              )}
              {readOnly && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">
                  Solo lectura
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {renderStudies()}
          </div>
        </CardContent>
      </Card>

      {/* Modal para ver estudio */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-greenPrimary" />
              {selectedStudy?.studyType?.name || "Estudio"}
              {selectedStudy?.isExternal && (
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 text-xs ml-2"
                >
                  <Building2 className="h-3 w-3 mr-1" />
                  Externo
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedStudy && (
            <div className="space-y-4">
              {/* Fecha */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Fecha:</span>
                <span>{formatDate(selectedStudy.date)}</span>
              </div>

              {/* Institución externa */}
              {selectedStudy.isExternal && selectedStudy.externalInstitution && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Institución:</span>
                  <span className="text-orange-700">{selectedStudy.externalInstitution}</span>
                </div>
              )}

              {/* Notas */}
              {selectedStudy.note && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Observaciones:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedStudy.note}
                  </p>
                </div>
              )}

              {/* Preview del archivo */}
              {selectedStudy.signedUrl ? (
                <div className="border rounded-lg overflow-hidden">
                  {selectedStudy.locationS3?.toLowerCase().endsWith('.pdf') ? (
                    // PDF - mostrar iframe embebido
                    <iframe
                      src={selectedStudy.signedUrl}
                      className="w-full h-64"
                      title={selectedStudy.studyType?.name || "Estudio PDF"}
                    />
                  ) : (
                    // Imagen - mostrar directamente
                    <img
                      src={selectedStudy.signedUrl}
                      alt={selectedStudy.studyType?.name || "Estudio"}
                      className="w-full max-h-80 object-contain bg-gray-50"
                    />
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {selectedStudy.isExternal
                      ? "Estudio externo sin archivo adjunto"
                      : "Sin archivo adjunto"}
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-2 pt-2">
                {selectedStudy.signedUrl && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleOpenInNewTab}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver completo
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleOpenInNewTab}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </>
                )}
                {/* Botón eliminar para estudios externos creados por el doctor */}
                {selectedStudy.isExternal &&
                  selectedStudy.signedDoctorId &&
                  currentDoctorId &&
                  selectedStudy.signedDoctorId === currentDoctorId &&
                  userData?.userId && (
                  <DeleteStudyDialog
                    idStudy={selectedStudy.id}
                    userId={userData.userId}
                    studies={[]}
                    onDeleteSuccess={handleCloseModal}
                  />
                )}
                <Button
                  variant="ghost"
                  onClick={handleCloseModal}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudiesSection;
