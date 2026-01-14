import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, List, RefreshCcw, LayoutGrid, Users } from "lucide-react";
import {
  BigCalendar,
  MonthCalendar,
  AppointmentsTable,
  CreateAppointmentDialog,
  CreateOverturnDialog,
} from "@/components/Appointments";
import { QueuePanel } from "@/components/Queue";
import { PageHeader } from "@/components/PageHeader";
import { useQueryClient } from "@tanstack/react-query";
import useUserRole from "@/hooks/useRoles";
import "@/components/Appointments/Calendar/big-calendar.css";

const ShiftsPage = () => {
  const queryClient = useQueryClient();
  const { isDoctor } = useUserRole();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['overturns'] });
    queryClient.invalidateQueries({ queryKey: ['waitingList'] });
    queryClient.invalidateQueries({ queryKey: ['doctorTodayAppointments'] });
    queryClient.invalidateQueries({ queryKey: ['doctorTodayOverturns'] });
    queryClient.invalidateQueries({ queryKey: ['doctorAgenda'] });
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: isDoctor ? "Mis Turnos" : "Turnos" },
  ];

  const headerActions = (
    <div className="flex items-center gap-2 flex-wrap">
      {!isDoctor && (
        <>
          <CreateAppointmentDialog />
          <CreateOverturnDialog />
        </>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={handleRefresh}
        className="shadow-sm hover:shadow-md transition-shadow"
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>{isDoctor ? "Mis Turnos" : "Gestión de Turnos"}</title>
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title={isDoctor ? "Mis Turnos" : "Gestión de Turnos"}
        description={
          isDoctor
            ? "Visualización de tus turnos y sobreturnos"
            : "Administración de citas médicas y sobreturnos"
        }
        icon={<Calendar className="h-6 w-6" />}
        actions={headerActions}
      />

      {/* Content: diferentes vistas según rol */}
      {isDoctor ? (
        <BigCalendar autoFilterForDoctor={true} />
      ) : (
        <Tabs defaultValue="queue" className="flex-1">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cola
            </TabsTrigger>
            <TabsTrigger value="big-calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="simple-calendar" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Vista Simple
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-6">
            <QueuePanel />
          </TabsContent>

          <TabsContent value="big-calendar" className="mt-6">
            <BigCalendar />
          </TabsContent>

          <TabsContent value="simple-calendar" className="mt-6">
            <MonthCalendar />
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <AppointmentsTable />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ShiftsPage;
