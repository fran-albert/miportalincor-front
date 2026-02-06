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
    <div className="space-y-4">
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <ScrollArea className="w-full">
                <div className="flex w-max pb-3">
                  <TabsList className="h-auto p-1 bg-muted">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.doctorId}
                        value={`doctor-${tab.doctorId}`}
                        className="relative pr-8 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <Stethoscope className="h-4 w-4 mr-2" />
                        <span className="truncate max-w-[150px]">{tab.doctorName}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTab(tab.doctorId);
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="shrink-0"
              title="Agregar médico"
            >
              <Plus className="h-4 w-4" />
            </Button>
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
