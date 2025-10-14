import { useParams } from "react-router-dom";
import { useCompany } from "@/hooks/Company/useCompany";
import useUserRole from "@/hooks/useRoles";
import CompanyDashboard from "@/components/Companies/Dashboard/Component";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Building2 } from "lucide-react";

const CompanyPage = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useUserRole();

  const { company, isLoading, isError } = useCompany({
    id: Number(id),
    auth: !!session,
    fetch: true,
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Empresas", href: "/incor-laboral/empresas" },
    { label: company?.name || "Cargando...", href: `/incor-laboral/empresas/${id}` },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title="Cargando empresa..."
          description="Por favor espera mientras cargamos la información"
          icon={<Building2 className="h-6 w-6" />}
        />

        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="relative bg-gradient-to-r from-teal-500 to-greenPrimary p-8 pb-20" />
          <div className="relative px-8 -mt-12 pb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title="Error al cargar empresa"
          description="No se pudo cargar la información de la empresa"
          icon={<Building2 className="h-6 w-6" />}
        />

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">No se encontró la empresa</h3>
                <p className="text-sm">
                  La empresa solicitada no existe o no tienes permisos para verla.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title={company.name}
        description={`Información y colaboradores de ${company.name}`}
        icon={<Building2 className="h-6 w-6" />}
      />

      <CompanyDashboard company={company} />
    </div>
  );
};

export default CompanyPage;
