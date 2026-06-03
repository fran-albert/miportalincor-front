import { BarChart3, Ticket } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { PageHeader } from "@/components/PageHeader";
import { AppointmentsManagementDashboardContainer } from "@/components/Appointments-Analytics";
import { TotemReportDashboardContainer } from "@/components/Totem-Analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AppointmentsReportsPage = () => {
  return (
    <>
      <Helmet>
        <title>Reportes de Turnos</title>
      </Helmet>
      <div className="space-y-8 p-6">
        <PageHeader
          breadcrumbItems={[
            { label: "Inicio", href: "/inicio" },
            { label: "Reportes de Turnos" },
          ]}
          title="Reportes de Turnos"
          description="Dashboard ejecutivo para turnos y seguimiento operativo diario del Totem."
          icon={<BarChart3 className="h-6 w-6" />}
        />

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 border-b bg-transparent p-0">
            <TabsTrigger
              value="appointments"
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Turnos
            </TabsTrigger>
            <TabsTrigger
              value="totem"
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Ticket className="mr-2 h-4 w-4" />
              Totem
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-0">
            <AppointmentsManagementDashboardContainer showHeader={false} />
          </TabsContent>

          <TabsContent value="totem" className="mt-0">
            <TotemReportDashboardContainer showHeader={false} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AppointmentsReportsPage;
