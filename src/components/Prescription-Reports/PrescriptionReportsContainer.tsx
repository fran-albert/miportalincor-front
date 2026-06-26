import { useState } from "react";
import { format, subMonths } from "date-fns";
import { SummaryCards } from "./SummaryCards";
import { WeeklyTrendChart } from "./WeeklyTrendChart";
import { DoctorRankingTable } from "./DoctorRankingTable";
import { DoctorVolumeChart } from "./DoctorVolumeChart";
import { DateRangeFilter } from "./DateRangeFilter";
import {
  usePrescriptionReportSummary,
  usePrescriptionReportByDoctor,
  usePrescriptionReportWeeklyTrend,
} from "@/hooks/Prescription-Reports/usePrescriptionReports";

export function PrescriptionReportsContainer() {
  const [from, setFrom] = useState(() =>
    format(subMonths(new Date(), 1), "yyyy-MM-dd")
  );
  const [to, setTo] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const { data: summaryData, isLoading: summaryLoading } =
    usePrescriptionReportSummary(from, to);
  const { data: doctorData, isLoading: doctorLoading } =
    usePrescriptionReportByDoctor(from, to);
  const { data: weeklyData, isLoading: weeklyLoading } =
    usePrescriptionReportWeeklyTrend(from, to);

  const handleRangeChange = (newFrom: string, newTo: string) => {
    setFrom(newFrom);
    setTo(newTo);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-greenPrimary">
            Reportes de Recetas
          </h1>
          <p className="text-muted-foreground">
            Métricas y análisis del servicio de recetas médicas.
          </p>
        </div>
        <DateRangeFilter
          from={from}
          to={to}
          onRangeChange={handleRangeChange}
        />
      </div>

      <SummaryCards data={summaryData} isLoading={summaryLoading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyTrendChart data={weeklyData} isLoading={weeklyLoading} />
        <DoctorVolumeChart data={doctorData} isLoading={doctorLoading} />
      </div>

      <DoctorRankingTable data={doctorData} isLoading={doctorLoading} />
    </div>
  );
}
