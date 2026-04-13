import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format, parse, subDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  ClipboardCheck,
  FileText,
  MessageSquareText,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import useRoles from "@/hooks/useRoles";
import { useMyEnrollments } from "@/hooks/Program/useMyEnrollments";
import { useCurrentPlan } from "@/hooks/Program/useCurrentPlan";
import { useAttendanceRecords } from "@/hooks/Program/useAttendanceRecords";
import { useCompliance } from "@/hooks/Program/useCompliance";
import MyFollowUpTab from "@/components/Programs/MyPrograms/FollowUp/MyFollowUpTab";
import {
  EnrollmentStatusColors,
  EnrollmentStatusLabels,
} from "@/types/Program/ProgramEnrollment";
import { AttendanceMethodLabels } from "@/types/Program/Attendance";
import { FrequencyPeriodLabels } from "@/types/Program/ProgramPlan";

const getComplianceTone = (value: number) => {
  if (value >= 80) {
    return {
      barClassName: "bg-emerald-500",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (value >= 50) {
    return {
      barClassName: "bg-amber-400",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    barClassName: "bg-rose-500",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
  };
};

const formatSelectedDate = (value: string) =>
  format(parse(value, "yyyy-MM-dd", new Date()), "dd/MM/yyyy", {
    locale: es,
  });

const formatFrequencyText = (
  count: number,
  period: keyof typeof FrequencyPeriodLabels
) => {
  const times = `${count} ${count === 1 ? "vez" : "veces"}`;

  if (period === "WEEKLY") {
    return `${times} por semana`;
  }

  if (period === "BIWEEKLY") {
    return `${times} cada 2 semanas`;
  }

  return `${times} por mes`;
};

interface ProgramSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ProgramSection = ({ title, icon, children }: ProgramSectionProps) => (
  <section className="rounded-[30px] bg-white p-5 shadow-md sm:p-6">
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-greenPrimary to-teal-600 p-2.5 text-white shadow-sm">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  </section>
);

const MyEnrollmentDetailPage = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const { session } = useRoles();
  const { enrollments, isLoading } = useMyEnrollments();
  const enrollment = enrollments.find((item) => item.id === enrollmentId);

  const { currentPlan } = useCurrentPlan(enrollmentId!);
  const { records } = useAttendanceRecords(enrollmentId!);

  const today = new Date();
  const [from, setFrom] = useState(format(subDays(today, 30), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(today, "yyyy-MM-dd"));
  const { compliance } = useCompliance(enrollmentId!, from, to);

  const sortedRecords = useMemo(
    () =>
      [...records].sort(
        (left, right) =>
          new Date(right.attendedAt).getTime() -
          new Date(left.attendedAt).getTime()
      ),
    [records]
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-500 shadow-sm">
          Cargando tu programa...
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-500 shadow-sm">
          No pudimos encontrar esta inscripción.
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Mis Programas", href: "/mis-programas" },
    { label: enrollment.programName ?? "Programa" },
  ];

  const patientName =
    [session?.firstName, session?.lastName].filter(Boolean).join(" ") ||
    "Paciente";
  const currentCompliance = compliance
    ? Math.round(compliance.globalCompliance)
    : null;
  const complianceTone =
    currentCompliance !== null ? getComplianceTone(currentCompliance) : null;

  return (
    <>
      <Helmet>
        <title>{enrollment.programName ?? "Mi Programa"}</title>
      </Helmet>

      <div className="space-y-8 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title={enrollment.programName ?? "Programa"}
          description="Tu seguimiento, en una sola pantalla."
          icon={<ClipboardCheck className="h-6 w-6" />}
          actions={
            <Badge className={EnrollmentStatusColors[enrollment.status]}>
              Estado: {EnrollmentStatusLabels[enrollment.status]}
            </Badge>
          }
        />

        <ProgramSection
          title="Mi plan"
          icon={<FileText className="h-5 w-5" />}
        >
          {currentPlan ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-700">
                  Versión {currentPlan.version}
                </p>
                <p className="text-sm text-slate-500">
                  Desde{" "}
                  {format(new Date(currentPlan.validFrom), "dd/MM/yyyy", {
                    locale: es,
                  })}
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {currentPlan.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-slate-900">
                        {activity.activityName}
                      </h3>
                      {activity.notes && (
                        <p className="text-sm text-slate-500">{activity.notes}</p>
                      )}
                    </div>

                    <Badge
                      variant="outline"
                      className="w-fit border-greenPrimary/20 bg-greenPrimary/5 text-greenPrimary"
                    >
                      {formatFrequencyText(
                        activity.frequencyCount,
                        activity.frequencyPeriod
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 text-sm text-slate-500">
              Todavía no tenés un plan asignado en este programa.
            </div>
          )}
        </ProgramSection>

        <ProgramSection
          title="Cómo vengo"
          icon={<TrendingUp className="h-5 w-5" />}
        >
          <div className="space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-700">Desde</Label>
                  <Input
                    type="date"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-700">Hasta</Label>
                  <Input
                    type="date"
                    value={to}
                    onChange={(event) => setTo(event.target.value)}
                  />
                </div>
              </div>

            </div>

            {compliance ? (
              <div className="space-y-5">
                <div className="space-y-3 rounded-3xl bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Cumplimiento general
                      </p>
                      <p className="text-sm text-slate-500">
                        Del {formatSelectedDate(from)} al {formatSelectedDate(to)}
                      </p>
                    </div>
                    <span className="text-2xl font-semibold text-slate-900">
                      {Math.round(compliance.globalCompliance)}%
                    </span>
                  </div>

                  <div className="h-4 rounded-full bg-slate-200">
                    <div
                      className={cn(
                        "h-4 rounded-full transition-all",
                        complianceTone?.barClassName ?? "bg-greenPrimary"
                      )}
                      style={{
                        width: `${Math.min(compliance.globalCompliance, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {compliance.activities.length > 0 && (
                  <div className="divide-y divide-slate-100">
                    {compliance.activities.map((activity) => {
                      const activityTone = getComplianceTone(activity.compliance);

                      return (
                        <div
                          key={activity.activityId}
                          className="space-y-3 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                              <h3 className="text-base font-semibold text-slate-900">
                                {activity.activityName}
                              </h3>
                              <p className="text-sm text-slate-500">
                                {activity.attended} realizadas de {activity.expected}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn("w-fit", activityTone.badgeClassName)}
                            >
                              {Math.round(activity.compliance)}%
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="h-3 flex-1 rounded-full bg-slate-200">
                              <div
                                className={cn(
                                  "h-3 rounded-full transition-all",
                                  activityTone.barClassName
                                )}
                                style={{
                                  width: `${Math.min(activity.compliance, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Todavía no hay datos de cumplimiento para este período.
              </p>
            )}
          </div>
        </ProgramSection>

        <ProgramSection
          title="Asistencias"
          icon={<Calendar className="h-5 w-5" />}
        >
          {sortedRecords.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {sortedRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      {record.activityName || "Actividad"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {format(new Date(record.attendedAt), "dd/MM/yyyy HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={
                      record.method === "QR"
                        ? "w-fit border-greenPrimary/20 bg-greenPrimary/5 text-greenPrimary"
                        : "w-fit border-slate-200 bg-slate-50 text-slate-700"
                    }
                  >
                    {AttendanceMethodLabels[record.method]}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-sm text-slate-500">
              Todavía no tenés asistencias registradas en este programa.
            </div>
          )}
        </ProgramSection>

        <ProgramSection
          title="Seguimiento"
          icon={<MessageSquareText className="h-5 w-5" />}
        >
          <MyFollowUpTab
            enrollmentId={enrollmentId!}
            patientName={patientName}
            programName={enrollment.programName ?? "Programa"}
          />
        </ProgramSection>
      </div>
    </>
  );
};

export default MyEnrollmentDetailPage;
