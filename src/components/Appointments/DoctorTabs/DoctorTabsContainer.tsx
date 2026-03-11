import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, X, Stethoscope } from "lucide-react";
import { BigCalendar } from "../Calendar/BigCalendar";
import { AddDoctorTabDialog } from "./AddDoctorTabDialog";
import { useDoctorTabs } from "@/hooks/Appointments/useDoctorTabs";

export const DoctorTabsContainer = () => {
  const { tabs, activeTab, setActiveTab, addTab, removeTab } = useDoctorTabs();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // IDs of already open doctors to exclude from selector
  const openDoctorIds = tabs.map((t) => t.doctorId);

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      {tabs.length === 0 ? (
        // Initial state: no tabs open
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/50">
          <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4 text-center">
            No hay médicos seleccionados.
            <br />
            Agrega uno para ver su calendario.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Médico
          </Button>
        </div>
      ) : (
        <>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 max-w-full overflow-x-hidden">
          <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Médicos abiertos</p>
                <p className="text-xs text-slate-500">
                  Cambiá de agenda sin perder la vista actual de cada profesional.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
                className="h-10 shrink-0 rounded-2xl border-slate-200 px-4 text-slate-700 shadow-sm"
                title="Agregar médico"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar médico
              </Button>
            </div>

            <div className="min-w-0 flex-1">
              <ScrollArea className="w-full max-w-full whitespace-nowrap">
                <div className="flex w-max pb-2">
                  <TabsList className="h-auto gap-2 rounded-2xl bg-slate-100/80 p-1.5">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.doctorId}
                        value={`doctor-${tab.doctorId}`}
                        className="group relative flex min-w-[220px] items-center justify-start gap-3 rounded-xl border border-transparent bg-white/70 px-4 py-3 pr-10 text-left text-slate-600 transition-all hover:border-slate-200 hover:bg-white data-[state=active]:border-blue-200 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_10px_24px_rgba(37,99,235,0.12)]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Stethoscope className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {tab.doctorName}
                          </span>
                          <span className="block text-xs text-slate-500">
                            Agenda activa
                          </span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTab(tab.doctorId);
                          }}
                          className="absolute right-2 top-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Cerrar ${tab.doctorName}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
          </div>

        </Tabs>

        {/* Render all calendars but only show the active one.
            Using display:none preserves component state (date, view, scroll)
            and avoids remounting hooks on tab switch. */}
        {tabs.map((tab) => {
          const isActive = activeTab === `doctor-${tab.doctorId}`;
          return (
            <div
              key={tab.doctorId}
              className="mt-4"
              style={{ display: isActive ? "block" : "none" }}
            >
              <BigCalendar
                doctorId={tab.doctorId}
                doctorName={tab.doctorName}
                isActive={isActive}
              />
            </div>
          );
        })}
        </>
      )}

      <AddDoctorTabDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        excludeDoctorIds={openDoctorIds}
        onSelectDoctor={(doctor) => {
          addTab(doctor);
          setIsAddDialogOpen(false);
        }}
      />
    </div>
  );
};

export default DoctorTabsContainer;
