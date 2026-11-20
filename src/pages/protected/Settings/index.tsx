import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TvMediaManager } from "@/components/TvMedia/TvMediaManager";
import { CheckupTypesManager } from "@/components/PeriodicCheckup";
import { ConsultationTypesManager } from "@/components/ConsultationTypes";
import { Monitor, Settings, CalendarClock, Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import useRoles from "@/hooks/useRoles";

export default function SettingsPage() {
  const { isAdmin } = useRoles();
  const pageTitle = isAdmin ? "Configuración" : "Tipos de estudio";
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: pageTitle },
  ];

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title={pageTitle}
        description={
          isAdmin
            ? "Gestiona las configuraciones del sistema"
            : "Creá, editá o desactivá los tipos de estudio que se usan al dar turnos"
        }
        icon={<Settings className="h-6 w-6" />}
      />

      {/* La secretaria solo administra los tipos de estudio: Pantalla TV y
          Chequeos Periódicos siguen siendo solo del administrador. */}
      {!isAdmin ? (
        <ConsultationTypesManager />
      ) : (
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
      )}
    </div>
  );
}
