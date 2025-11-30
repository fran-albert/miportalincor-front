import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Eye,
  Download,
  FileImageIcon,
  TestTubeIcon,
  Activity,
  Zap,
  StethoscopeIcon,
  FileText,
} from "lucide-react";
import DeleteStudyDialog from "../Delete/dialog";

export interface StudyCardProps {
  id: number;
  tipo: string;
  categoria: string;
  descripcion: string;
  fecha: string;
  medico: string;
  archivo: {
    nombre: string;
    tipo: "PDF" | "JPG" | "PNG" | "DICOM";
    tamaño: string;
    url: string;
  };
  signedUrl?: string;
  estado: "Completado" | "Pendiente" | "En proceso";
  canDelete?: boolean;
  patientId?: string;
}

const getCategoryIcon = (categoria: string) => {
  const iconClass = "h-6 w-6";
  switch (categoria) {
    case "Imagenología":
      return <FileImageIcon className={`${iconClass} text-blue-500`} />;
    case "Laboratorio":
      return <TestTubeIcon className={`${iconClass} text-green-500`} />;
    case "Cardiología":
      return <Activity className={`${iconClass} text-red-500`} />;
    case "Neurología":
      return <Zap className={`${iconClass} text-purple-500`} />;
    case "Endocrinología":
      return <StethoscopeIcon className={`${iconClass} text-orange-500`} />;
    case "Otros":
      return <FileText className={`${iconClass} text-gray-500`} />;
    default:
      return <FileText className={`${iconClass} text-gray-500`} />;
  }
};

const getCategoryColor = (categoria: string) => {
  switch (categoria) {
    case "Imagenología":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Laboratorio":
      return "bg-green-100 text-green-700 border-green-200";
    case "Cardiología":
      return "bg-red-100 text-red-700 border-red-200";
    case "Neurología":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "Endocrinología":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Otros":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "Completado":
      return "bg-green-100 text-green-800";
    case "Pendiente":
      return "bg-yellow-100 text-yellow-800";
    case "En proceso":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const StudyCard: React.FC<StudyCardProps> = ({
  id,
  tipo,
  categoria,
  descripcion,
  fecha,
  medico,
  archivo,
  signedUrl,
  estado,
  canDelete = false,
  patientId,
}) => {
  const handleView = () => {
    window.open(signedUrl || archivo.url, "_blank");
  };

  const handleDownload = () => {
    window.open(signedUrl || archivo.url, "_blank");
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 space-y-4">
        {/* Header con icono y categoría */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">{getCategoryIcon(categoria)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-gray-900 truncate">
                {tipo}
              </h3>
              <Badge
                variant="outline"
                className={`mt-1 text-xs ${getCategoryColor(categoria)}`}
              >
                {categoria}
              </Badge>
            </div>
          </div>
          <Badge className={`${getEstadoColor(estado)} flex-shrink-0 text-xs`}>
            {estado}
          </Badge>
        </div>

        {/* Descripción */}
        {descripcion && descripcion !== "Sin descripción" && (
          <p className="text-sm text-gray-600 line-clamp-2">{descripcion}</p>
        )}

        {/* Información adicional */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{fecha}</span>
          </div>
          {medico && medico !== "Dr. No especificado" && (
            <div className="flex items-center gap-2">
              <StethoscopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{medico}</span>
            </div>
          )}
        </div>

        {/* Archivo info */}
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
          <FileText className="h-3 w-3" />
          <span className="truncate flex-1">{archivo.nombre}</span>
          <span className="flex-shrink-0">
            {archivo.tipo} • {archivo.tamaño}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
            onClick={handleView}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
          {canDelete && patientId && (
            <DeleteStudyDialog
              idStudy={id}
              userId={parseInt(patientId)}
              studies={[]}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyCard;
