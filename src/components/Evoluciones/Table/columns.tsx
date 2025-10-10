import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Printer,
  Clock
} from "lucide-react";
import { formatDoctorInfo } from "@/common/helpers/helpers";
import {
  canDeleteEvolution,
  formatEvolutionDateTime,
  truncateEvolutionText,
  getDeleteTimeRemaining
} from "@/common/helpers/evolutionHelpers";
import ActionIcon from "@/components/Icons/action";
import useUserRole from "@/hooks/useRoles";
import { Evolucion, EvolucionData } from "@/types/Antecedentes/Antecedentes";

// Tipo para las evoluciones procesadas en la tabla
export interface EvolutionTableRow {
  id: string;
  fechaConsulta: string;
  fechaCreacion: string;
  doctor: {
    userId: number;
    firstName: string;
    lastName: string;
    specialities: { id: number; name: string }[];
  };
  motivoConsulta: string | null;
  enfermedadActual: string | null;
  examenFisico: string | null;
  diagnosticosPresuntivos: string | null;
  evolucionCompleta: {
    fechaConsulta: string;
    fechaCreacion: string;
    doctor: Evolucion['doctor'];
    especialidad: string | null;
    motivoConsulta: string | null;
    enfermedadActual: string | null;
    examenFisico: string | null;
    diagnosticosPresuntivos: string | null;
    evolucionPrincipal: Evolucion | null;
    mediciones: EvolucionData[];
    evoluciones: Evolucion[];
  };
}

interface ColumnsProps {
  onView: (evolucion: EvolutionTableRow) => void;
  onDelete: (evolucion: EvolutionTableRow) => void;
  onPrint: (evolucion: EvolutionTableRow) => void;
}

export const getEvolutionColumns = ({
  onView,
  onDelete,
  onPrint
}: ColumnsProps): ColumnDef<EvolutionTableRow>[] => [
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const evolucion = row.original;
      const { session } = useUserRole();
      const canDelete = canDeleteEvolution(evolucion.fechaCreacion);
      const isOwner = session?.id && parseInt(session.id, 10) === evolucion.doctor.userId;
      const canDeleteThis = canDelete && isOwner;

      return (
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onPrint(evolucion);
              }}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir PDF
              </DropdownMenuItem>

              {canDeleteThis ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(evolucion);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled>
                  <Clock className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>No se puede eliminar</span>
                    <span className="text-xs text-gray-500">
                      {getDeleteTimeRemaining(evolucion.fechaCreacion)}
                    </span>
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    size: 100,
  },
  {
    accessorKey: "fechaConsulta",
    header: "Fecha",
    cell: ({ row }) => {
      const dateTime = formatEvolutionDateTime(row.original.fechaConsulta);
      return (
        <div className="min-w-[120px]">
          <div className="font-medium">{dateTime.date}</div>
          <div className="text-sm text-gray-500">{dateTime.time}</div>
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "doctor",
    header: "Médico",
    cell: ({ row }) => {
      const doctorInfo = formatDoctorInfo(row.original.doctor);
      return (
        <div className="min-w-[200px]">
          <div className="font-medium text-sm">
            {doctorInfo.fullNameWithPrimarySpeciality}
          </div>
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: "motivoConsulta",
    header: "Motivo de Consulta",
    cell: ({ row }) => {
      const motivo = truncateEvolutionText(row.original.motivoConsulta, 80);
      return (
        <div
          className="max-w-[300px] cursor-pointer hover:bg-gray-50 p-2 rounded"
          onClick={() => onView(row.original)}
          title={row.original.motivoConsulta || 'Sin motivo especificado'}
        >
          <span className="text-sm">{motivo}</span>
        </div>
      );
    },
    size: 300,
  },
  {
    id: "ver",
    header: "Ver",
    cell: ({ row }) => {
      return (
        <div onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onView(row.original);
        }}>
          <ActionIcon
            tooltip="Ver evolución completa"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => onView(row.original)}
          />
        </div>
      );
    },
    enableSorting: false,
    size: 70,
  },
];