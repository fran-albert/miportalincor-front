import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCcw, Users } from "lucide-react";
import {
  BigCalendar,
  CreateAppointmentDialog,
  CreateOverturnDialog,
} from "@/components/Appointments";
import { DoctorTabsContainer } from "@/components/Appointments/DoctorTabs";
import { QueuePanel } from "@/components/Queue";
import { PageHeader } from "@/components/PageHeader";
import { useQueryClient } from "@tanstack/react-query";
import useUserRole from "@/hooks/useRoles";
import { useCanSelfManageSchedule } from "@/hooks/DoctorBookingSettings";
import "@/components/Appointments/Calendar/big-calendar.css";

const ShiftsPage = () => {
  const queryClient = useQueryClient();
  const { isDoctor } = useUserRole();
  const { canSelfManage, doctorId } = useCanSelfManageSchedule();

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
    { label: isDoctor && canSelfManage ? "Gestión de Turnos" : isDoctor ? "Mis Turnos" : "Turnos" },
  ];

  const headerActions = (
    <div className="flex items-center gap-2 flex-wrap">
      {(!isDoctor || canSelfManage) && (
        <>
          <CreateAppointmentDialog fixedDoctorId={isDoctor && canSelfManage ? doctorId : undefined} allowGuestCreation={!isDoctor} />
          <CreateOverturnDialog fixedDoctorId={isDoctor && canSelfManage ? doctorId : undefined} allowGuestCreation={!isDoctor} />
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
        title={isDoctor && canSelfManage ? "Gestión de Turnos" : isDoctor ? "Mis Turnos" : "Gestión de Turnos"}
        description={
          isDoctor && canSelfManage
            ? "Gestioná tus turnos, crea citas y sobreturnos"
            : isDoctor
            ? "Visualización de tus turnos y sobreturnos"
            : "Administración de citas médicas y sobreturnos"
        }
        icon={<Calendar className="h-6 w-6" />}
        actions={headerActions}
      />

      {/* Content: diferentes vistas según rol */}
      {isDoctor ? (
        <BigCalendar autoFilterForDoctor={true} blockOnly={!canSelfManage} fixedDoctorId={canSelfManage ? doctorId : undefined} />
      ) : (
        <Tabs defaultValue="calendar" className="flex-1">
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-100 p-1.5">
            <TabsTrigger
              value="calendar"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-greenPrimary data-[state=active]:shadow-md"
            >
              <Calendar className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger
              value="queue"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-greenPrimary data-[state=active]:shadow-md"
            >
              <Users className="h-4 w-4" />
              Cola del Día
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <DoctorTabsContainer />
          </TabsContent>

          <TabsContent value="queue" className="mt-6">
            <QueuePanel />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ShiftsPage;
