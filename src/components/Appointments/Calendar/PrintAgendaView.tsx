import { useMemo, useCallback } from "react";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, FileDown } from "lucide-react";
import {
  AppointmentFullResponseDto,
  AppointmentStatus,
  AppointmentStatusLabels,
  AppointmentOrigin,
  AppointmentOriginLabels,
} from "@/types/Appointment/Appointment";
import { OverturnDetailedDto, OverturnStatus, OverturnStatusLabels } from "@/types/Overturn/Overturn";
import { toast } from "sonner";

/** Escape HTML entities to prevent XSS in generated print HTML */
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

interface PrintableEvent {
  id: number | string;
  date: string;
  hour: string;
  patientName: string;
  patientDni?: string;
  healthInsurance?: string;
  affiliationNumber?: string;
  consultationType?: string;
  status: string;
  statusLabel: string;
  type: "appointment" | "overturn";
  origin?: string;
  phone?: string;
}

interface PrintAgendaViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: AppointmentFullResponseDto[];
  overturns: OverturnDetailedDto[];
  currentDate: Date;
  currentView: string;
  doctorName?: string;
}

const CANCELLED_STATUSES = [
  AppointmentStatus.CANCELLED_BY_PATIENT,
  AppointmentStatus.CANCELLED_BY_SECRETARY,
];

export const PrintAgendaView = ({
  open,
  onOpenChange,
  appointments,
  overturns,
  currentDate,
  currentView,
  doctorName,
}: PrintAgendaViewProps) => {
  const isWeekView = currentView === "week" || currentView === "work_week";

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );
  const weekEnd = useMemo(
    () => endOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );

  // Build printable events list
  const printableEvents = useMemo<PrintableEvent[]>(() => {
    const events: PrintableEvent[] = [];

    // Filter appointments (exclude cancelled)
    const activeAppointments = appointments.filter(
      (apt) => !CANCELLED_STATUSES.includes(apt.status)
    );

    activeAppointments.forEach((apt) => {
      const isGuest = apt.isGuest === 1 || apt.isGuest === true;
      const patientName = isGuest
        ? `${apt.guestFirstName || ""} ${apt.guestLastName || ""}`.trim()
        : `${apt.patient?.firstName || ""} ${apt.patient?.lastName || ""}`.trim();

      events.push({
        id: apt.id,
        date: apt.date,
        hour: apt.hour.slice(0, 5),
        patientName: patientName || "Sin nombre",
        patientDni: isGuest ? apt.guestDocumentNumber : apt.patient?.userName,
        healthInsurance: isGuest ? undefined : apt.patient?.healthInsuranceName,
        affiliationNumber: isGuest ? undefined : apt.patient?.affiliationNumber,
        consultationType: apt.consultationType?.name,
        status: apt.status,
        statusLabel: AppointmentStatusLabels[apt.status],
        type: "appointment",
        origin: apt.origin ? AppointmentOriginLabels[apt.origin as AppointmentOrigin] : undefined,
        phone: isGuest ? apt.guestPhone : apt.patient?.phoneNumber,
      });
    });

    overturns.forEach((ot) => {
      events.push({
        id: `ot-${ot.id}`,
        date: ot.date,
        hour: ot.hour.slice(0, 5),
        patientName: `${ot.patient?.firstName || ""} ${ot.patient?.lastName || ""}`.trim() || "Sin nombre",
        patientDni: ot.patient?.userName,
        healthInsurance: ot.patient?.healthInsuranceName,
        affiliationNumber: ot.patient?.affiliationNumber,
        status: ot.status,
        statusLabel: OverturnStatusLabels[ot.status as OverturnStatus] || ot.status,
        type: "overturn",
        phone: ot.patient?.phoneNumber,
      });
    });

    // Sort by date then hour
    events.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.hour.localeCompare(b.hour);
    });

    return events;
  }, [appointments, overturns]);

  // Filter events for current view
  const filteredEvents = useMemo(() => {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    if (isWeekView) {
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      const weekEndStr = format(weekEnd, "yyyy-MM-dd");
      return printableEvents.filter(
        (e) => e.date >= weekStartStr && e.date <= weekEndStr
      );
    }
    return printableEvents.filter((e) => e.date === dateStr);
  }, [printableEvents, currentDate, isWeekView, weekStart, weekEnd]);

  // Group events by date for week view
  const eventsByDate = useMemo(() => {
    const groups: Record<string, PrintableEvent[]> = {};
    filteredEvents.forEach((e) => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return groups;
  }, [filteredEvents]);

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const regularCount = filteredEvents.filter((e) => e.type === "appointment").length;
    const overturnCount = filteredEvents.filter((e) => e.type === "overturn").length;
    return { total, regularCount, overturnCount };
  }, [filteredEvents]);

  const generatePrintHtml = useCallback(() => {
    const title = isWeekView
      ? `Agenda Semanal - ${format(weekStart, "d MMM", { locale: es })} al ${format(weekEnd, "d MMM yyyy", { locale: es })}`
      : `Agenda del ${format(currentDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}`;

    const renderTable = (events: PrintableEvent[]) => {
      if (events.length === 0) return '<p style="color: #6b7280; font-style: italic; padding: 12px;">Sin turnos programados</p>';
      return `
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #1e3a5f; color: white;">
              <th style="padding: 8px 10px; text-align: left; font-weight: 600; width: 60px;">Hora</th>
              <th style="padding: 8px 10px; text-align: left; font-weight: 600;">Paciente</th>
              <th style="padding: 8px 10px; text-align: left; font-weight: 600; width: 90px;">DNI</th>
              <th style="padding: 8px 10px; text-align: left; font-weight: 600;">Obra Social</th>
              <th style="padding: 8px 10px; text-align: left; font-weight: 600; width: 80px;">N° Afiliado</th>
              <th style="padding: 8px 10px; text-align: left; font-weight: 600; width: 100px;">Tipo</th>
              <th style="padding: 8px 10px; text-align: left; font-weight: 600; width: 100px;">Tel.</th>
              <th style="padding: 8px 10px; text-align: center; font-weight: 600; width: 30px;"></th>
            </tr>
          </thead>
          <tbody>
            ${events.map((e, i) => `
              <tr style="border-bottom: 1px solid #e5e7eb; ${i % 2 === 0 ? "background: #f9fafb;" : ""}">
                <td style="padding: 7px 10px; font-weight: 600; font-variant-numeric: tabular-nums;">${escapeHtml(e.hour)}</td>
                <td style="padding: 7px 10px; font-weight: 500;">${escapeHtml(e.patientName)}</td>
                <td style="padding: 7px 10px; font-variant-numeric: tabular-nums;">${escapeHtml(e.patientDni || "-")}</td>
                <td style="padding: 7px 10px;">${escapeHtml(e.healthInsurance || "-")}</td>
                <td style="padding: 7px 10px; font-variant-numeric: tabular-nums;">${escapeHtml(e.affiliationNumber || "-")}</td>
                <td style="padding: 7px 10px; font-size: 10px;">${escapeHtml(e.consultationType || "-")}</td>
                <td style="padding: 7px 10px; font-size: 10px; font-variant-numeric: tabular-nums;">${escapeHtml(e.phone || "-")}</td>
                <td style="padding: 7px 10px; text-align: center; font-size: 10px;">${e.type === "overturn" ? "⚡" : ""}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    };

    let body = "";
    if (isWeekView) {
      const days: string[] = [];
      for (let i = 0; i < 7; i++) {
        days.push(format(addDays(weekStart, i), "yyyy-MM-dd"));
      }
      body = days
        .filter((d) => eventsByDate[d]?.length)
        .map((dateStr) => {
          const date = new Date(dateStr + "T12:00:00");
          return `
            <div style="margin-bottom: 20px; break-inside: avoid;">
              <h3 style="font-size: 13px; font-weight: 700; color: #1e3a5f; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px 0; padding-bottom: 4px; border-bottom: 2px solid #1e3a5f;">
                ${format(date, "EEEE d 'de' MMMM", { locale: es })}
                <span style="float: right; font-weight: 400; font-size: 11px; color: #6b7280; text-transform: none; letter-spacing: 0;">
                  ${eventsByDate[dateStr].length} turno${eventsByDate[dateStr].length !== 1 ? "s" : ""}
                </span>
              </h3>
              ${renderTable(eventsByDate[dateStr])}
            </div>
          `;
        })
        .join("");

      if (!body) {
        body = '<p style="color: #6b7280; font-style: italic; text-align: center; padding: 40px;">No hay turnos programados esta semana</p>';
      }
    } else {
      body = renderTable(filteredEvents);
      if (filteredEvents.length === 0) {
        body = '<p style="color: #6b7280; font-style: italic; text-align: center; padding: 40px;">No hay turnos programados para este d\u00eda</p>';
      }
    }

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <style>
          @page {
            margin: 15mm 12mm;
            size: A4 landscape;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #1f2937;
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px; border-bottom: 3px solid #1e3a5f; margin-bottom: 16px;">
          <div>
            <h1 style="font-size: 22px; font-weight: 800; color: #1e3a5f; letter-spacing: -0.5px;">INCOR</h1>
            <p style="font-size: 10px; color: #6b7280; margin-top: 1px;">Centro M\u00e9dico Integral</p>
          </div>
          <div style="text-align: right;">
            <h2 style="font-size: 15px; font-weight: 700; color: #1f2937;">${escapeHtml(title)}</h2>
            ${doctorName ? `<p style="font-size: 12px; color: #4b5563; margin-top: 2px;">${escapeHtml(doctorName)}</p>` : ""}
          </div>
        </div>

        <!-- Stats -->
        <div style="display: flex; gap: 16px; margin-bottom: 14px; font-size: 11px;">
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 6px 14px;">
            <strong>${stats.total}</strong> turnos totales
          </div>
          ${stats.overturnCount > 0 ? `
            <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 6px 14px;">
              <strong>${stats.overturnCount}</strong> sobreturno${stats.overturnCount !== 1 ? "s" : ""} ⚡
            </div>
          ` : ""}
        </div>

        <!-- Content -->
        ${body}

        <!-- Footer -->
        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #d1d5db; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af;">
          <span>Impreso el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}</span>
          <span>INCOR Centro M\u00e9dico - Sistema de Turnos</span>
        </div>
      </body>
      </html>
    `;
  }, [isWeekView, weekStart, weekEnd, currentDate, doctorName, filteredEvents, eventsByDate, stats]);

  const handlePrint = useCallback(() => {
    const html = generatePrintHtml();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("El navegador bloqueó la ventana de impresión. Permita ventanas emergentes e intente de nuevo.");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    let printed = false;
    printWindow.onload = () => {
      if (!printed) {
        printed = true;
        printWindow.print();
      }
    };
    // Fallback for browsers where onload doesn't fire reliably
    setTimeout(() => {
      if (!printed) {
        printed = true;
        printWindow.print();
      }
    }, 500);
  }, [generatePrintHtml]);

  const handleDownloadCsv = useCallback(() => {
    const headers = ["Fecha", "Hora", "Paciente", "DNI", "Obra Social", "N° Afiliado", "Tipo Consulta", "Teléfono", "Tipo", "Estado"];
    const rows = filteredEvents.map((e) => [
      e.date,
      e.hour,
      e.patientName,
      e.patientDni || "",
      e.healthInsurance || "",
      e.affiliationNumber || "",
      e.consultationType || "",
      e.phone || "",
      e.type === "overturn" ? "Sobreturno" : "Turno",
      e.statusLabel,
    ]);

    const sanitizeCsvField = (val: string) => {
      // Prevent CSV formula injection in Excel
      if (/^[=+\-@\t\r]/.test(val)) return `'${val}`;
      return val;
    };

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${sanitizeCsvField(c).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateLabel = isWeekView
      ? `semana-${format(weekStart, "yyyy-MM-dd")}`
      : format(currentDate, "yyyy-MM-dd");
    a.href = url;
    a.download = `agenda-${dateLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredEvents, isWeekView, weekStart, currentDate]);

  const viewLabel = isWeekView
    ? `${format(weekStart, "d MMM", { locale: es })} - ${format(weekEnd, "d MMM yyyy", { locale: es })}`
    : format(currentDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Printer className="h-5 w-5" />
            Imprimir Agenda
          </DialogTitle>
        </DialogHeader>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 capitalize">{viewLabel}</p>
                {doctorName && <p className="text-sm text-slate-500">{doctorName}</p>}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                <p className="text-xs text-slate-500">
                  turno{stats.total !== 1 ? "s" : ""}
                  {stats.overturnCount > 0 && ` (${stats.overturnCount} sobreturno${stats.overturnCount !== 1 ? "s" : ""})`}
                </p>
              </div>
            </div>
          </div>

          {/* Preview table */}
          <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-800 text-white sticky top-0">
                <tr>
                  {isWeekView && <th className="px-2 py-2 text-left font-medium">Fecha</th>}
                  <th className="px-2 py-2 text-left font-medium w-14">Hora</th>
                  <th className="px-2 py-2 text-left font-medium">Paciente</th>
                  <th className="px-2 py-2 text-left font-medium">DNI</th>
                  <th className="px-2 py-2 text-left font-medium">O. Social</th>
                  <th className="px-2 py-2 text-left font-medium">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isWeekView ? 6 : 5}
                      className="px-4 py-8 text-center text-slate-400 italic"
                    >
                      No hay turnos programados
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((e, i) => (
                    <tr key={e.id} className={i % 2 === 0 ? "bg-slate-50" : ""}>
                      {isWeekView && (
                        <td className="px-2 py-1.5 text-slate-500">
                          {format(new Date(e.date + "T12:00:00"), "EEE d", { locale: es })}
                        </td>
                      )}
                      <td className="px-2 py-1.5 font-semibold tabular-nums">{e.hour}</td>
                      <td className="px-2 py-1.5 font-medium">
                        {e.type === "overturn" && <span className="text-orange-500 mr-1">⚡</span>}
                        {e.patientName}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums text-slate-600">{e.patientDni || "-"}</td>
                      <td className="px-2 py-1.5 text-slate-600">{e.healthInsurance || "-"}</td>
                      <td className="px-2 py-1.5 text-slate-500">{e.consultationType || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handlePrint} className="flex-1 h-11 bg-slate-800 hover:bg-slate-900">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleDownloadCsv} variant="outline" className="flex-1 h-11">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
