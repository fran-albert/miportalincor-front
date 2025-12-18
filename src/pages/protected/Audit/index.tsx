import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/Table/table";
import { AuditFilters } from "@/components/Audit/Filters/AuditFilters";
import { AuditDetailDialog } from "@/components/Audit/Detail/AuditDetailDialog";
import { getColumns } from "@/components/Audit/Table/columns";
import { useAuditLogs, useExportAuditLogs } from "@/hooks/Audit/useAuditLogs";
import LoadingAnimation from "@/components/Loading/loading";
import type { AuditLog } from "@/types/Audit/Audit";

const AuditPage = () => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    logs,
    total,
    page,
    totalPages,
    isLoading,
    isFetching,
    isError,
    filters,
    updateFilters,
    clearFilters,
    nextPage,
    prevPage,
  } = useAuditLogs({ initialLimit: 20 });

  const { exportLogs, isExporting } = useExportAuditLogs();

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      await exportLogs(format, filters);
    } catch (error) {
      console.error("Error exporting:", error);
    }
  };

  const columns = getColumns({ onViewDetail: handleViewDetail });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Auditoria" },
  ];

  if (isError) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error al cargar los registros de auditoria.</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Auditoria</title>
      </Helmet>

      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title="Registros de Auditoria"
          description="Registro de todas las operaciones realizadas en el sistema"
          icon={<Shield className="h-6 w-6" />}
          badge={total}
        />

        {/* Filtros */}
        <AuditFilters
          filters={filters}
          onFilterChange={updateFilters}
          onClearFilters={clearFilters}
        />

        {/* Botones de exportacion */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            disabled={isExporting || total === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
            disabled={isExporting || total === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar JSON
          </Button>
          {isExporting && (
            <span className="text-sm text-muted-foreground self-center">
              Exportando...
            </span>
          )}
        </div>

        {/* Tabla */}
        {isLoading ? (
          <LoadingAnimation />
        ) : (
          <div className="overflow-hidden sm:rounded-lg">
            <DataTable
              columns={columns}
              data={logs}
              showSearch={false}
              canAddUser={false}
              isLoading={isLoading}
              isFetching={isFetching}
              useServerSideSearch={true}
              searchQuery={filters.entityName || filters.userId || "audit"}
              currentPage={page}
              totalPages={totalPages}
              onNextPage={nextPage}
              onPrevPage={prevPage}
            />
          </div>
        )}

        {/* Dialog de detalle */}
        <AuditDetailDialog
          log={selectedLog}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </>
  );
};

export default AuditPage;
