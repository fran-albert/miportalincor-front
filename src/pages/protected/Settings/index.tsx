import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TvMediaManager } from "@/components/TvMedia/TvMediaManager";
import { CheckupTypesManager } from "@/components/PeriodicCheckup";
import { ConsultationTypesManager } from "@/components/ConsultationTypes";
import { Monitor, Settings, CalendarClock, Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function SettingsPage() {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Configuración" },
  ];

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Configuración</title>
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Configuración"
        description="Gestiona las configuraciones del sistema"
        icon={<Settings className="h-6 w-6" />}
      />

      <Tabs defaultValue="consultation-types" className="w-full">
        <TabsList>
          <TabsTrigger value="consultation-types" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Tipos de Turno
          </TabsTrigger>
          <TabsTrigger value="tv-media" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Pantalla TV
          </TabsTrigger>
          <TabsTrigger value="checkups" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Chequeos Periódicos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consultation-types" className="mt-6">
          <ConsultationTypesManager />
        </TabsContent>

        <TabsContent value="tv-media" className="mt-6">
          <TvMediaManager />
        </TabsContent>

        <TabsContent value="checkups" className="mt-6">
          <CheckupTypesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
