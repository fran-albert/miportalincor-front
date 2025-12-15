import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TvMediaManager } from "@/components/TvMedia/TvMediaManager";
import { Monitor, Settings } from "lucide-react";
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

      <Tabs defaultValue="tv-media" className="w-full">
        <TabsList>
          <TabsTrigger value="tv-media" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Pantalla TV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tv-media" className="mt-6">
          <TvMediaManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
