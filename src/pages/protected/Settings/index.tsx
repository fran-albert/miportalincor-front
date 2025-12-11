import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TvMediaManager } from "@/components/TvMedia/TvMediaManager";
import { Monitor, Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-greenPrimary" />
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">
            Gestiona las configuraciones del sistema
          </p>
        </div>
      </div>

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
