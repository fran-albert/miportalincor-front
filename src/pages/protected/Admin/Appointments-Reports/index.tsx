import { BarChart3, Ticket } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { PageHeader } from "@/components/PageHeader";
import { AppointmentsManagementDashboardContainer } from "@/components/Appointments-Analytics";
import { TotemReportDashboardContainer } from "@/components/Totem-Analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

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
          <Card className="border-border/70">
            <CardContent className="pt-6">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="appointments"
                  className="border border-border/70 px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Turnos
                </TabsTrigger>
                <TabsTrigger
                  value="totem"
                  className="border border-border/70 px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  Totem
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

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
