import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { AuditLog, AuditAction } from "@/types/Audit/Audit";
import { getActionColor, getActionLabel } from "@/types/Audit/Audit";
import { formatDateWithTime } from "@/common/helpers/helpers";

interface GetColumnsOptions {
  onViewDetail: (log: AuditLog) => void;
}

export const getColumns = ({
  onViewDetail,
}: GetColumnsOptions): ColumnDef<AuditLog>[] => {
  return [
    {
      accessorKey: "timestamp",
      header: "Fecha",
      cell: ({ row }) => (
        <div className="text-sm whitespace-nowrap">
          {formatDateWithTime(row.original.timestamp)}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Accion",
      cell: ({ row }) => {
        const action = row.original.action as AuditAction;
        return (
          <Badge className={getActionColor(action)}>
            {getActionLabel(action)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "entityName",
      header: "Entidad",
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.entityName}</div>
      ),
    },
    {
      accessorKey: "entityId",
      header: "ID Entidad",
      cell: ({ row }) => {
        const entityId = row.original.entityId;
        const truncated =
          entityId.length > 12 ? `${entityId.substring(0, 12)}...` : entityId;
        return (
          <div className="text-sm text-muted-foreground font-mono" title={entityId}>
            {truncated}
          </div>
        );
      },
    },
    {
      accessorKey: "userEmail",
      header: "Usuario",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm">{row.original.userEmail}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.userRoles?.join(", ")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "module",
      header: "Modulo",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.module}
        </Badge>
      ),
    },
    {
      accessorKey: "metadata.ip",
      header: "IP",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground font-mono">
          {row.original.metadata?.ip || "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetail(row.original)}
          title="Ver detalle"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];
};
