import { Helmet } from "react-helmet-async";
import { PageHeader } from "@/components/PageHeader";
import { ClipboardCheck, HeartPulse } from "lucide-react";
import { useMyEnrollments } from "@/hooks/Program/useMyEnrollments";
import MyProgramsList from "@/components/Programs/MyPrograms/MyProgramsList";
import { Card, CardContent } from "@/components/ui/card";

const MyProgramsPage = () => {
  const { enrollments, isLoading, isError } = useMyEnrollments();

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Mis Programas" },
  ];

  return (
    <>
      <Helmet>
        <title>Mis Programas</title>
      </Helmet>
      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title="Mis Programas"
          description="Todo tu seguimiento en un solo lugar."
          icon={<ClipboardCheck className="h-6 w-6" />}
          badge={enrollments.length}
        />

        <Card className="overflow-hidden border-0 bg-gradient-to-r from-greenPrimary to-teal-600 text-white shadow-xl">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/15 p-3">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">Tus programas de salud</p>
                <p className="text-sm text-white/85">
                  Plan, asistencias y seguimiento.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
              {enrollments.length} {enrollments.length === 1 ? "programa" : "programas"}
            </div>
          </CardContent>
        </Card>

        {isError && <div>Hubo un error al cargar tus programas.</div>}
        {isLoading ? (
          <div className="rounded-3xl bg-white px-5 py-8 text-sm text-slate-500 shadow-md">
            Cargando tus programas...
          </div>
        ) : (
          <MyProgramsList enrollments={enrollments} />
        )}
      </div>
    </>
  );
};

export default MyProgramsPage;
