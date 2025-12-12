import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, List, ArrowLeft, RefreshCcw, LayoutGrid, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BigCalendar,
  MonthCalendar,
  AppointmentsTable,
  WaitingListCard,
  CreateAppointmentDialog,
  CreateOverturnDialog,
} from "@/components/Appointments";
import { DoctorSelect } from "@/components/Appointments/Select/DoctorSelect";
import { QueuePanel } from "@/components/Queue";
import { useQueryClient } from "@tanstack/react-query";
import useUserRole from "@/hooks/useRoles";
import "@/components/Appointments/Calendar/big-calendar.css";

const ShiftsPage = () => {
  const queryClient = useQueryClient();
  const { isDoctor, isSecretary, isAdmin } = useUserRole();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>();

  // Si es médico, no mostramos selector de doctor ni panel de cola general
  const showDoctorFilter = !isDoctor && (isSecretary || isAdmin);
  const showQueuePanel = !isDoctor && (isSecretary || isAdmin);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['overturns'] });
    queryClient.invalidateQueries({ queryKey: ['waitingList'] });
    queryClient.invalidateQueries({ queryKey: ['doctorTodayAppointments'] });
    queryClient.invalidateQueries({ queryKey: ['doctorTodayOverturns'] });
    queryClient.invalidateQueries({ queryKey: ['doctorAgenda'] });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-greenPrimary flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            {isDoctor ? "Mis Turnos" : "Gestión de Turnos"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isDoctor
              ? "Visualización de tus turnos y sobreturnos"
              : "Administración de citas médicas y sobreturnos"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isDoctor && (
            <>
              <CreateAppointmentDialog defaultDoctorId={selectedDoctorId} />
              <CreateOverturnDialog defaultDoctorId={selectedDoctorId} />
            </>
          )}
          {!isDoctor && (
            <Link to="/horarios-medicos">
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Horarios
              </Button>
            </Link>
          )}
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Link to="/inicio">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      {/* Doctor Filter for Waiting List - solo para secretarias/admins */}
      {showDoctorFilter && (
        <div className="flex items-center gap-4">
          <div className="w-72">
            <DoctorSelect
              value={selectedDoctorId}
              onValueChange={setSelectedDoctorId}
              placeholder="Seleccionar médico para lista de espera"
            />
          </div>
        </div>
      )}

      {/* Waiting List - Always visible when doctor is selected (solo para secretarias/admins) */}
      {showDoctorFilter && selectedDoctorId && (
        <WaitingListCard
          doctorId={selectedDoctorId}
          maxHeight="250px"
        />
      )}

      {/* Tabs: diferentes vistas según rol */}
      {isDoctor ? (
        // Vista simplificada para médicos - solo calendario
        <BigCalendar autoFilterForDoctor={true} />
      ) : (
        // Vista completa para secretarias/admins
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

          <TabsContent value="queue" className="mt-4">
            <QueuePanel />
          </TabsContent>

          <TabsContent value="big-calendar" className="mt-4">
            <BigCalendar />
          </TabsContent>

          <TabsContent value="simple-calendar" className="mt-4">
            <MonthCalendar />
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <AppointmentsTable />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ShiftsPage;
