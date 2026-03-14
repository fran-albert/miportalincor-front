import { useState } from "react";
import { format, subMonths } from "date-fns";
import { BarChart3, FilterX } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeFilter } from "@/components/Prescription-Reports/DateRangeFilter";
import { DoctorSelect } from "@/components/Appointments/Select/DoctorSelect";
import { ConsultationTypeSelect } from "@/components/Appointments/Select/ConsultationTypeSelect";
import { OriginSelect } from "./OriginSelect";
import { ManagementSummaryCards } from "./ManagementSummaryCards";
import { ConsultationTypeVolumeChart } from "./ConsultationTypeVolumeChart";
import { OriginMixChart } from "./OriginMixChart";
import { DoctorOriginChart } from "./DoctorOriginChart";
import { CancellationTrendChart } from "./CancellationTrendChart";
import {
  useAppointmentsAnalyticsByConsultationType,
  useAppointmentsAnalyticsByDoctor,
  useAppointmentsAnalyticsByOrigin,
  useAppointmentsAnalyticsCancellations,
  useAppointmentsAnalyticsOverview,
  useOverturnAnalyticsOverview,
} from "@/hooks/Appointments-Analytics";
import { AppointmentOrigin } from "@/types/Appointment/Appointment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppointmentsManagementDashboardContainer() {
  const [dateFrom, setDateFrom] = useState(() =>
    format(subMonths(new Date(), 3), "yyyy-MM-dd")
  );
  const [dateTo, setDateTo] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [doctorId, setDoctorId] = useState<number | undefined>(undefined);
  const [consultationTypeId, setConsultationTypeId] = useState<number | undefined>(undefined);
  const [origin, setOrigin] = useState<AppointmentOrigin | undefined>(undefined);

  const filters = {
    dateFrom,
    dateTo,
    doctorId,
    consultationTypeId,
    origin,
  };

  const overviewQuery = useAppointmentsAnalyticsOverview(filters);
  const byTypeQuery = useAppointmentsAnalyticsByConsultationType(filters);
  const byOriginQuery = useAppointmentsAnalyticsByOrigin(filters);
  const byDoctorQuery = useAppointmentsAnalyticsByDoctor(filters);
  const cancellationsQuery = useAppointmentsAnalyticsCancellations(filters);
  const overturnOverviewQuery = useOverturnAnalyticsOverview(filters);

  const isSummaryLoading = overviewQuery.isLoading || overturnOverviewQuery.isLoading;
  const hasActiveFilters = !!doctorId || !!consultationTypeId || !!origin;

  const clearNonDateFilters = () => {
    setDoctorId(undefined);
    setConsultationTypeId(undefined);
    setOrigin(undefined);
  };

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        breadcrumbItems={[
          { label: "Inicio", href: "/inicio" },
          { label: "Reportes de Turnos" },
        ]}
        title="Reportes de Turnos"
        description="Vista ejecutiva para dirección y gerencia sobre volumen, cancelaciones, origen y sobreturnos."
        icon={<BarChart3 className="h-6 w-6" />}
      />

      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Filtros</h2>
            <p className="text-sm text-muted-foreground">
              Acotá el análisis por período, médico, tipo de turno y origen.
            </p>
          </div>
          <DateRangeFilter
            from={dateFrom}
            to={dateTo}
            onRangeChange={(nextFrom, nextTo) => {
              setDateFrom(nextFrom);
              setDateTo(nextTo);
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DoctorSelect
            value={doctorId}
            onValueChange={setDoctorId}
            placeholder="Todos los médicos"
            allowClear
          />
          <ConsultationTypeSelect
            value={consultationTypeId}
            onValueChange={setConsultationTypeId}
            placeholder="Todos los tipos"
          />
          <OriginSelect value={origin} onValueChange={setOrigin} />
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {doctorId && <Badge variant="secondary">Médico filtrado</Badge>}
            {consultationTypeId && <Badge variant="secondary">Tipo filtrado</Badge>}
            {origin && <Badge variant="secondary">Origen filtrado</Badge>}
            {!hasActiveFilters && (
              <span className="text-sm text-muted-foreground">
                Sin filtros adicionales activos.
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={clearNonDateFilters}
            disabled={!hasActiveFilters}
            className="w-full md:w-auto"
          >
            <FilterX className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        </div>
      </div>

      <ManagementSummaryCards
        overview={overviewQuery.data}
        overturnOverview={overturnOverviewQuery.data}
        isLoading={isSummaryLoading}
      />

      <div className="grid gap-7 xl:grid-cols-2">
        <ConsultationTypeVolumeChart
          data={byTypeQuery.data}
          isLoading={byTypeQuery.isLoading}
        />
        <OriginMixChart
          data={byOriginQuery.data}
          isLoading={byOriginQuery.isLoading}
        />
      </div>

      <div className="grid gap-7 xl:grid-cols-2">
        <CancellationTrendChart
          data={cancellationsQuery.data?.trend}
          isLoading={cancellationsQuery.isLoading}
        />
        <DoctorOriginChart
          data={byDoctorQuery.data}
          isLoading={byDoctorQuery.isLoading}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Sobreturnos por médico</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {!overturnOverviewQuery.data?.byDoctor?.length ? (
            <div className="text-sm text-muted-foreground">
              Sin sobreturnos para el período seleccionado.
            </div>
          ) : (
            <div className="space-y-3">
              {overturnOverviewQuery.data.byDoctor.slice(0, 8).map((item) => (
                <div key={item.id ?? item.label} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.total}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
