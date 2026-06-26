import { Helmet } from "react-helmet-async";
import { PageHeader } from "@/components/PageHeader";
import { ClipboardCheck } from "lucide-react";
import { useMyEnrollments } from "@/hooks/Program/useMyEnrollments";
import MyProgramsList from "@/components/Programs/MyPrograms/MyProgramsList";

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
