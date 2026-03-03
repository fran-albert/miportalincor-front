import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, FileText, Calendar, TrendingUp } from "lucide-react";
import { useMyEnrollments } from "@/hooks/Program/useMyEnrollments";
import { useCurrentPlan } from "@/hooks/Program/useCurrentPlan";
import { useAttendanceRecords } from "@/hooks/Program/useAttendanceRecords";
import { useCompliance } from "@/hooks/Program/useCompliance";
import {
  EnrollmentStatusLabels,
  EnrollmentStatusColors,
} from "@/types/Program/ProgramEnrollment";
import { FrequencyPeriodLabels } from "@/types/Program/ProgramPlan";
import { AttendanceMethodLabels } from "@/types/Program/Attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MyEnrollmentDetailPage = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const { enrollments, isLoading } = useMyEnrollments();
  const enrollment = enrollments.find((e) => e.id === enrollmentId);

  const { currentPlan } = useCurrentPlan(enrollmentId!);
  const { records } = useAttendanceRecords(enrollmentId!);

  const today = new Date();
  const [from, setFrom] = useState(format(subDays(today, 30), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(today, "yyyy-MM-dd"));
  const { compliance } = useCompliance(enrollmentId!, from, to);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Inscripción no encontrada.</div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Mis Programas", href: "/mis-programas" },
    { label: enrollment.program?.name ?? "Programa" },
  ];

  return (
    <>
      <Helmet>
        <title>{enrollment.program?.name ?? "Mi Programa"}</title>
      </Helmet>
      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title={enrollment.program?.name ?? "Programa"}
          icon={<ClipboardCheck className="h-6 w-6" />}
          actions={
            <Badge className={EnrollmentStatusColors[enrollment.status]}>
              {EnrollmentStatusLabels[enrollment.status]}
            </Badge>
          }
        />

        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Mi Plan
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Asistencia
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Cumplimiento
            </TabsTrigger>
          </TabsList>

          {/* Plan Tab - Read Only */}
          <TabsContent value="plan" className="mt-6">
            {currentPlan ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Plan Versión {currentPlan.version}
                    </CardTitle>
                    <Badge variant="outline">
                      Desde{" "}
                      {format(
                        new Date(currentPlan.validFrom),
                        "dd/MM/yyyy",
                        { locale: es }
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentPlan.activities.map((pa) => (
                      <div
                        key={pa.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <div className="font-medium">
                            {pa.activityName}
                          </div>
                          {pa.notes && (
                            <div className="text-sm text-gray-500">
                              {pa.notes}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {pa.frequencyCount}x{" "}
                          {FrequencyPeriodLabels[pa.frequencyPeriod]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No tenés un plan asignado todavía.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Attendance Tab - Read Only */}
          <TabsContent value="attendance" className="mt-6">
            {records.length > 0 ? (
              <div className="space-y-2">
                {records.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {record.activityName || "Actividad"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(
                              new Date(record.attendedAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: es }
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            record.method === "QR"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-orange-50 text-orange-700"
                          }
                        >
                          {AttendanceMethodLabels[record.method]}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No tenés asistencias registradas.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Compliance Tab - Read Only */}
          <TabsContent value="compliance" className="mt-6 space-y-4">
            <div className="flex items-end gap-4">
              <div className="space-y-1">
                <Label className="text-sm">Desde</Label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Hasta</Label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>

            {compliance ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Tu Cumplimiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-4 w-full rounded-full bg-gray-200">
                          <div
                            className="h-4 rounded-full bg-greenPrimary transition-all"
                            style={{
                              width: `${Math.min(compliance.globalCompliance, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-lg font-bold text-greenPrimary">
                        {Math.round(compliance.globalCompliance)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {compliance.activities.map((ac) => (
                  <Card key={ac.activityId}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{ac.activityName}</span>
                        <span className="text-sm text-gray-500">
                          {ac.attended}/{ac.expected}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-3 w-full rounded-full bg-gray-200">
                            <div
                              className="h-3 rounded-full transition-all"
                              style={{
                                width: `${Math.min(ac.compliance, 100)}%`,
                                backgroundColor:
                                  ac.compliance >= 80
                                    ? "#22c55e"
                                    : ac.compliance >= 50
                                      ? "#eab308"
                                      : "#ef4444",
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">
                          {Math.round(ac.compliance)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No hay datos de cumplimiento.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default MyEnrollmentDetailPage;
