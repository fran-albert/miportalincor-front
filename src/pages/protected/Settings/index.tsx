import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TvMediaManager } from "@/components/TvMedia/TvMediaManager";
import { CheckupTypesManager } from "@/components/PeriodicCheckup";
import { Monitor, Settings, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { FEATURE_FLAGS } from "@/common/constants/featureFlags";

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

      <Tabs defaultValue="checkups" className="w-full">
        <TabsList>
          {FEATURE_FLAGS.QUEUE_ENABLED && (
            <TabsTrigger value="tv-media" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Pantalla TV
            </TabsTrigger>
          )}
          <TabsTrigger value="checkups" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Chequeos Periódicos
          </TabsTrigger>
        </TabsList>

        {FEATURE_FLAGS.QUEUE_ENABLED && (
          <TabsContent value="tv-media" className="mt-6">
            <TvMediaManager />
          </TabsContent>
        )}

        <TabsContent value="checkups" className="mt-6">
          <CheckupTypesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
