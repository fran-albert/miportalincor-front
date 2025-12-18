import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { AuditQueryParams, AuditAction } from "@/types/Audit/Audit";
import { AUDIT_ACTIONS, AUDIT_MODULES } from "@/types/Audit/Audit";

interface AuditFiltersProps {
  filters: AuditQueryParams;
  onFilterChange: (filters: Partial<AuditQueryParams>) => void;
  onClearFilters: () => void;
}

export function AuditFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: AuditFiltersProps) {
  const handleActionChange = (value: string) => {
    onFilterChange({
      action: value === "all" ? undefined : (value as AuditAction),
    });
  };

  const handleModuleChange = (value: string) => {
    onFilterChange({
      module: value === "all" ? undefined : value,
    });
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      userId: e.target.value || undefined,
    });
  };

  const handleEntityNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      entityName: e.target.value || undefined,
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFilterChange({
      dateFrom: date ? date.toISOString().split("T")[0] : undefined,
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFilterChange({
      dateTo: date ? date.toISOString().split("T")[0] : undefined,
    });
  };

  const hasActiveFilters =
    filters.action ||
    filters.module ||
    filters.userId ||
    filters.entityName ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Accion */}
        <div className="space-y-2">
          <Label htmlFor="action">Accion</Label>
          <Select
            value={filters.action || "all"}
            onValueChange={handleActionChange}
          >
            <SelectTrigger id="action">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {AUDIT_ACTIONS.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Modulo */}
        <div className="space-y-2">
          <Label htmlFor="module">Modulo</Label>
          <Select
            value={filters.module || "all"}
            onValueChange={handleModuleChange}
          >
            <SelectTrigger id="module">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {AUDIT_MODULES.map((module) => (
                <SelectItem key={module.value} value={module.value}>
                  {module.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Entidad */}
        <div className="space-y-2">
          <Label htmlFor="entityName">Entidad</Label>
          <Input
            id="entityName"
            placeholder="Ej: Patient"
            value={filters.entityName || ""}
            onChange={handleEntityNameChange}
          />
        </div>

        {/* Usuario ID */}
        <div className="space-y-2">
          <Label htmlFor="userId">Usuario ID</Label>
          <Input
            id="userId"
            placeholder="Ej: 1"
            value={filters.userId || ""}
            onChange={handleUserIdChange}
          />
        </div>

        {/* Fecha Desde */}
        <div className="space-y-2">
          <Label>Desde</Label>
          <DatePicker
            value={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
            onChange={handleDateFromChange}
          />
        </div>

        {/* Fecha Hasta */}
        <div className="space-y-2">
          <Label>Hasta</Label>
          <DatePicker
            value={filters.dateTo ? new Date(filters.dateTo) : undefined}
            onChange={handleDateToChange}
          />
        </div>
      </div>
    </div>
  );
}
