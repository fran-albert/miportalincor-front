import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
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

export interface Study {
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
}

export interface Laboratory {
  id: number;
  tipo: string;
  fecha: string;
  laboratorio: string;
  medico: string;
  parametros: {
    nombre: string;
    valor: string;
    unidad: string;
    referencia: string;
    estado: string;
  }[];
  archivo: { nombre: string; tipo: string; tamaño: string; url: string };
  signedUrl?: string;
  estado: string;
}

const getCategoryIcon = (categoria: string) => {
  switch (categoria) {
    case "Imagenología":
      return <FileImageIcon className="h-5 w-5 text-blue-500" />;
    case "Laboratorio":
      return <TestTubeIcon className="h-5 w-5 text-green-500" />;
    case "Cardiología":
      return <Activity className="h-5 w-5 text-red-500" />;
    case "Neurología":
      return <Zap className="h-5 w-5 text-purple-500" />;
    case "Endocrinología":
      return <StethoscopeIcon className="h-5 w-5 text-orange-500" />;
    case "Otros":
      return <FileText className="h-5 w-5 text-gray-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

export const createStudiesColumns = (
  canDelete: boolean,
  patientId: string
): ColumnDef<Study>[] => [
  {
    id: "index",
    header: "#",
    meta: {
      headerClassName: "w-16",
      cellClassName: "w-16",
    },
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return (
        <div className="text-center font-medium text-gray-600">
          {pageIndex * pageSize + row.index + 1}
        </div>
      );
    },
  },
  {
    accessorKey: "tipo",
    header: "Tipo de Estudio",
    cell: ({ row }) => {
      const study = row.original;
      return (
        <div className="flex items-center gap-3">
          {getCategoryIcon(study.categoria)}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">{study.tipo}</p>
            {study.descripcion && (
              <p className="text-sm text-gray-600 mt-1 truncate">
                {study.descripcion}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span className="whitespace-nowrap">{row.original.fecha}</span>
        </div>
      );
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const study = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
            onClick={() =>
              window.open(study.signedUrl || study.archivo.url, "_blank")
            }
            title="Ver estudio"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
            onClick={() =>
              window.open(study.signedUrl || study.archivo.url, "_blank")
            }
            title="Descargar estudio"
          >
            <Download className="h-4 w-4" />
          </Button>
          {canDelete && (
            <DeleteStudyDialog
              idStudy={study.id}
              userId={parseInt(patientId)}
              studies={[]}
            />
          )}
        </div>
      );
    },
  },
];

export const createLaboratoriesColumns = (): ColumnDef<Laboratory>[] => [
  {
    id: "index",
    header: "#",
    meta: {
      headerClassName: "w-16",
      cellClassName: "w-16",
    },
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return (
        <div className="text-center font-medium text-gray-600">
          {pageIndex * pageSize + row.index + 1}
        </div>
      );
    },
  },
  {
    accessorKey: "tipo",
    header: "Tipo de Análisis",
    cell: ({ row }) => {
      const lab = row.original;
      return (
        <div className="flex items-center gap-3">
          <TestTubeIcon className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-medium text-gray-800">{lab.tipo}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          <span>{row.original.fecha}</span>
        </div>
      );
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const lab = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
            onClick={() =>
              window.open(lab.signedUrl || lab.archivo.url, "_blank")
            }
            title="Ver laboratorio"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
            onClick={() =>
              window.open(lab.signedUrl || lab.archivo.url, "_blank")
            }
            title="Descargar laboratorio"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
