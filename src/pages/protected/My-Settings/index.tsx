import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { MyAvailabilities, MyAbsences } from "@/components/MySettings";
import { Settings, Calendar, CalendarOff } from "lucide-react";
import useUserRole from "@/hooks/useRoles";

export default function MySettingsPage() {
  const { session } = useUserRole();
  const doctorId = typeof session?.id === 'string' ? parseInt(session.id, 10) : (session?.id ?? 0);

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Mi Configuración" },
  ];

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Mi Configuración</title>
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Mi Configuración"
        description="Visualiza tus horarios y ausencias configuradas"
        icon={<Settings className="h-6 w-6" />}
      />

      <Tabs defaultValue="availabilities" className="w-full">
        <TabsList>
          <TabsTrigger value="availabilities" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Mis Horarios
          </TabsTrigger>
          <TabsTrigger value="absences" className="flex items-center gap-2">
            <CalendarOff className="h-4 w-4" />
            Mis Ausencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="availabilities" className="mt-6">
          <MyAvailabilities doctorId={doctorId} />
        </TabsContent>

        <TabsContent value="absences" className="mt-6">
          <MyAbsences doctorId={doctorId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
