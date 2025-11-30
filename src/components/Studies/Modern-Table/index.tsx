import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ImageIcon
} from 'lucide-react';
import { StudiesWithURL } from '@/types/Study/Study';
import { formatDate } from '@/common/helpers/helpers';

interface ModernStudiesTableProps {
  studies: StudiesWithURL[];
  onViewStudy?: (study: StudiesWithURL) => void;
  onDownloadStudy?: (study: StudiesWithURL) => void;
}

const getCategoryFromStudyType = (studyTypeName?: string): string => {
  if (!studyTypeName) return 'Otros';
  
  const studyType = studyTypeName.toLowerCase();
  
  if (studyType.includes('ecograf') || studyType.includes('radiograf') || studyType.includes('tomograf') || studyType.includes('resonancia')) {
    return 'Imagenología';
  }
  if (studyType.includes('hemograma') || studyType.includes('sangre') || studyType.includes('glucemia') || studyType.includes('perfil') || studyType.includes('análisis')) {
    return 'Laboratorio';
  }
  if (studyType.includes('cardio') || studyType.includes('electrocardiograma') || studyType.includes('ecg')) {
    return 'Cardiología';
  }
  if (studyType.includes('neuro') || studyType.includes('electroencefalograma') || studyType.includes('eeg')) {
    return 'Neurología';
  }
  if (studyType.includes('endocrin') || studyType.includes('hormona') || studyType.includes('tiroides')) {
    return 'Endocrinología';
  }
  
  return 'Otros';
};

const getCategoryIcon = (categoria: string) => {
  switch (categoria) {
    case 'Imagenología':
      return <FileImageIcon className="h-5 w-5 text-blue-500" />;
    case 'Laboratorio':
      return <TestTubeIcon className="h-5 w-5 text-green-500" />;
    case 'Cardiología':
      return <Activity className="h-5 w-5 text-red-500" />;
    case 'Neurología':
      return <Zap className="h-5 w-5 text-purple-500" />;
    default:
      return <StethoscopeIcon className="h-5 w-5 text-gray-500" />;
  }
};

const getFileIcon = (fileName?: string) => {
  if (!fileName) return <FileText className="h-4 w-4 text-gray-500" />;
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return <FileText className="h-4 w-4 text-red-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

const getFileTypeFromExtension = (fileName?: string): string => {
  if (!fileName) return 'PDF';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'JPG';
    case 'png':
      return 'PNG';
    case 'pdf':
      return 'PDF';
    case 'dicom':
      return 'DICOM';
    default:
      return 'PDF';
  }
};

const ModernStudiesTable: React.FC<ModernStudiesTableProps> = ({
  studies,
  onViewStudy,
  onDownloadStudy,
}) => {
  const handleViewStudy = (study: StudiesWithURL) => {
    if (onViewStudy) {
      onViewStudy(study);
    } else if (study.signedUrl) {
      window.open(study.signedUrl, '_blank');
    }
  };

  const handleDownloadStudy = (study: StudiesWithURL) => {
    if (onDownloadStudy) {
      onDownloadStudy(study);
    } else if (study.signedUrl) {
      window.open(study.signedUrl, '_blank');
    }
  };

  if (studies.length === 0) {
    return (
      <div className="text-center py-12">
        <FileImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No se encontraron estudios</p>
        <p className="text-gray-400 text-sm mt-1">
          Los estudios aparecerán aquí cuando sean agregados
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo de Estudio</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Archivo</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {studies.map((study) => {
            const categoria = getCategoryFromStudyType(study.studyType?.name);
            const fileType = getFileTypeFromExtension(study.locationS3);
            
            return (
              <tr key={study.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(categoria)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {study.studyType?.name || 'Estudio Médico'}
                      </p>
                      {study.note && (
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {study.note}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className="text-xs"
                          variant="secondary"
                        >
                          {categoria}
                        </Badge>
                        {study.ultrasoundImages && study.ultrasoundImages.length > 0 && (
                          <Badge 
                            className="text-xs bg-purple-100 text-purple-800"
                            variant="secondary"
                          >
                            +{study.ultrasoundImages.length} imagen{study.ultrasoundImages.length !== 1 ? 'es' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {study.date ? formatDate(String(study.date)) : 'Sin fecha'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {getFileIcon(study.locationS3)}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {fileType}
                      </span>
                      <span className="text-xs text-gray-500">
                        Documento
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => handleViewStudy(study)}
                      title="Ver estudio"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                      onClick={() => handleDownloadStudy(study)}
                      title="Descargar estudio"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ModernStudiesTable;