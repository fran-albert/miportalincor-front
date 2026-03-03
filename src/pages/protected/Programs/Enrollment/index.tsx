import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEnrollment } from "@/hooks/Program/useEnrollment";
import { useProgram } from "@/hooks/Program/useProgram";
import { useProgramActivities } from "@/hooks/Program/useProgramActivities";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  FileText,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  EnrollmentStatusLabels,
  EnrollmentStatusColors,
} from "@/types/Program/ProgramEnrollment";
import PlanTab from "@/components/Programs/Enrollment/Plan/PlanTab";
import AttendanceTab from "@/components/Programs/Enrollment/Attendance/AttendanceTab";
import ComplianceTab from "@/components/Programs/Enrollment/Compliance/ComplianceTab";

const EnrollmentDetailPage = () => {
  const { programId, enrollmentId } = useParams<{
    programId: string;
    enrollmentId: string;
  }>();
  const { program } = useProgram(programId!);
  const { enrollment, isLoading } = useEnrollment(programId!, enrollmentId!);
  const { activities } = useProgramActivities(programId!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando inscripción...</div>
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

  const patientName = enrollment.patientFirstName
    ? `${enrollment.patientFirstName} ${enrollment.patientLastName}`
    : enrollment.patientUserId;

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Programas", href: "/programas" },
    {
      label: program?.name ?? "Programa",
      href: `/programas/${programId}`,
    },
    { label: patientName },
  ];

  return (
    <>
      <Helmet>
        <title>{patientName} - Inscripción</title>
      </Helmet>
      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title={patientName}
          description={`Inscripción en ${program?.name ?? "programa"}`}
          icon={<ClipboardList className="h-6 w-6" />}
          actions={
            <Badge
              className={EnrollmentStatusColors[enrollment.status]}
            >
              {EnrollmentStatusLabels[enrollment.status]}
            </Badge>
          }
        />

        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Plan
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
          <TabsContent value="plan" className="mt-6">
            <PlanTab enrollmentId={enrollmentId!} activities={activities} />
          </TabsContent>
          <TabsContent value="attendance" className="mt-6">
            <AttendanceTab
              enrollmentId={enrollmentId!}
              patientUserId={enrollment.patientUserId}
              activities={activities}
            />
          </TabsContent>
          <TabsContent value="compliance" className="mt-6">
            <ComplianceTab enrollmentId={enrollmentId!} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default EnrollmentDetailPage;
