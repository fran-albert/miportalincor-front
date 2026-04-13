import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useProgram } from "@/hooks/Program/useProgram";
import { useProgramMembership } from "@/hooks/Program/useProgramMembership";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Activity, ClipboardList } from "lucide-react";
import MembersTab from "@/components/Programs/Detail/Members/MembersTab";
import ActivitiesTab from "@/components/Programs/Detail/Activities/ActivitiesTab";
import EnrollmentsTab from "@/components/Programs/Detail/Enrollments/EnrollmentsTab";

const ProgramDetailPage = () => {
  const { programId } = useParams<{ programId: string }>();
  const { program, isLoading } = useProgram(programId!);
  const {
    isLoading: isLoadingMembership,
    isProgramMember,
  } = useProgramMembership(programId!);

  if (isLoading || isLoadingMembership) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando programa...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Programa no encontrado.</div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Programas", href: "/programas" },
    { label: program.name },
  ];

  return (
    <>
      <Helmet>
        <title>{program.name} - Programa</title>
      </Helmet>
      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title={program.name}
          description={program.description}
          icon={<GraduationCap className="h-6 w-6" />}
          actions={
            <Badge
              className={
                program.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {program.isActive ? "Activo" : "Inactivo"}
            </Badge>
          }
        />

        {isProgramMember ? (
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Miembros
              </TabsTrigger>
              <TabsTrigger
                value="activities"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Actividades
              </TabsTrigger>
              <TabsTrigger
                value="enrollments"
                className="flex items-center gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                Inscripciones
              </TabsTrigger>
            </TabsList>
            <TabsContent value="members" className="mt-6">
              <MembersTab programId={programId!} />
            </TabsContent>
            <TabsContent value="activities" className="mt-6">
              <ActivitiesTab programId={programId!} />
            </TabsContent>
            <TabsContent value="enrollments" className="mt-6">
              <EnrollmentsTab programId={programId!} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="space-y-2 p-6 text-sm text-slate-600">
              <p className="font-medium text-slate-900">
                La gestión clínica de este programa está reservada al equipo asignado.
              </p>
              <p>
                Para trabajar con miembros, actividades e inscripciones necesitás
                estar agregado al programa como coordinador o profesional.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default ProgramDetailPage;
