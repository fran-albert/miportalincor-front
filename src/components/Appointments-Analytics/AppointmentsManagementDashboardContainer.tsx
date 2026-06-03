import { useState } from "react";
import { format, subMonths } from "date-fns";
import { BarChart3, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DoctorSelect } from "@/components/Appointments/Select/DoctorSelect";
import { ConsultationTypeSelect } from "@/components/Appointments/Select/ConsultationTypeSelect";
import { DateRangeFilter } from "./DateRangeFilter";
import { OriginSelect } from "./OriginSelect";
import { ManagementSummaryCards } from "./ManagementSummaryCards";
import { ConsultationTypeVolumeChart } from "./ConsultationTypeVolumeChart";
import { OriginMixChart } from "./OriginMixChart";
import { DoctorOriginChart } from "./DoctorOriginChart";
import { CancellationTrendChart } from "./CancellationTrendChart";
import { formatNumber } from "./chartTheme";
import {
  useAppointmentsAnalyticsByConsultationType,
  useAppointmentsAnalyticsByDoctor,
  useAppointmentsAnalyticsByOrigin,
  useAppointmentsAnalyticsCancellations,
  useAppointmentsAnalyticsOverview,
  useOverturnAnalyticsOverview,
} from "@/hooks/Appointments-Analytics";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { useConsultationTypes } from "@/hooks/ConsultationType";
import { formatDoctorName } from "@/common/helpers/helpers";
import {
  AppointmentOrigin,
  AppointmentOriginLabels,
} from "@/types/Appointment/Appointment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AppointmentsManagementDashboardContainerProps {
  showHeader?: boolean;
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function ActiveFilterChip({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-background py-1 pl-3 pr-1.5 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

export function AppointmentsManagementDashboardContainer({
  showHeader = true,
}: AppointmentsManagementDashboardContainerProps) {
  const [dateFrom, setDateFrom] = useState(() =>
    format(subMonths(new Date(), 3), "yyyy-MM-dd")
  );
  const [dateTo, setDateTo] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [doctorId, setDoctorId] = useState<number | undefined>(undefined);
  const [consultationTypeId, setConsultationTypeId] = useState<
    number | undefined
  >(undefined);
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

  const { doctors } = useDoctors({ auth: true, fetchDoctors: true });
  const { consultationTypes } = useConsultationTypes(
    doctorId ? { doctorId } : undefined
  );

  const selectedDoctor = doctorId
    ? doctors.find((d) => Number(d.userId) === doctorId)
    : undefined;
  const selectedType = consultationTypeId
    ? consultationTypes.find((t) => t.id === consultationTypeId)
    : undefined;

  const isSummaryLoading =
    overviewQuery.isLoading || overturnOverviewQuery.isLoading;
  const hasActiveFilters = !!doctorId || !!consultationTypeId || !!origin;

  const clearNonDateFilters = () => {
    setDoctorId(undefined);
    setConsultationTypeId(undefined);
    setOrigin(undefined);
  };

  const overturnByDoctor = overturnOverviewQuery.data?.byDoctor ?? [];
  const maxOverturn = overturnByDoctor.reduce(
    (max, item) => Math.max(max, item.total),
    0
  );

  return (
    <div className={`space-y-7 ${showHeader ? "p-6" : ""}`}>
      {showHeader && (
        <PageHeader
          breadcrumbItems={[
            { label: "Inicio", href: "/inicio" },
            { label: "Reportes de Turnos" },
          ]}
          title="Reportes de Turnos"
          description="Vista ejecutiva para dirección y gerencia sobre volumen, cancelaciones, origen y sobreturnos."
          icon={<BarChart3 className="h-6 w-6" />}
        />
      )}

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
        <FilterField label="Período">
          <DateRangeFilter
            from={dateFrom}
            to={dateTo}
            onRangeChange={(nextFrom: string, nextTo: string) => {
              setDateFrom(nextFrom);
              setDateTo(nextTo);
            }}
          />
        </FilterField>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FilterField label="Médico">
            <DoctorSelect
              value={doctorId}
              onValueChange={setDoctorId}
              placeholder="Todos los médicos"
              allowClear
            />
          </FilterField>
          <FilterField label="Tipo de turno">
            <ConsultationTypeSelect
              value={consultationTypeId}
              onValueChange={setConsultationTypeId}
              placeholder="Todos los tipos"
            />
          </FilterField>
          <FilterField label="Origen">
            <OriginSelect value={origin} onValueChange={setOrigin} />
          </FilterField>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <span className="text-xs font-medium text-muted-foreground">
              Filtros activos:
            </span>
            {doctorId && (
              <ActiveFilterChip
                label="Médico"
                value={
                  selectedDoctor ? formatDoctorName(selectedDoctor) : "Seleccionado"
                }
                onRemove={() => setDoctorId(undefined)}
              />
            )}
            {consultationTypeId && (
              <ActiveFilterChip
                label="Tipo"
                value={selectedType ? selectedType.name : "Seleccionado"}
                onRemove={() => setConsultationTypeId(undefined)}
              />
            )}
            {origin && (
              <ActiveFilterChip
                label="Origen"
                value={AppointmentOriginLabels[origin]}
                onRemove={() => setOrigin(undefined)}
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearNonDateFilters}
              className="ml-auto h-8 text-muted-foreground hover:text-foreground"
            >
              Limpiar todo
            </Button>
          </div>
        )}
      </div>

      <ManagementSummaryCards
        overview={overviewQuery.data}
        overturnOverview={overturnOverviewQuery.data}
        isLoading={isSummaryLoading}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ConsultationTypeVolumeChart
          data={byTypeQuery.data}
          isLoading={byTypeQuery.isLoading}
        />
        <OriginMixChart
          data={byOriginQuery.data}
          isLoading={byOriginQuery.isLoading}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CancellationTrendChart
          data={cancellationsQuery.data?.trend}
          isLoading={cancellationsQuery.isLoading}
        />
        <DoctorOriginChart
          data={byDoctorQuery.data}
          isLoading={byDoctorQuery.isLoading}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sobreturnos por médico</CardTitle>
        </CardHeader>
        <CardContent>
          {!overturnByDoctor.length ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Sin sobreturnos para el período seleccionado.
            </div>
          ) : (
            <div className="space-y-3">
              {overturnByDoctor.slice(0, 8).map((item) => (
                <div key={item.id ?? item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatNumber(item.total)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{
                        width: `${
                          maxOverturn ? (item.total / maxOverturn) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
