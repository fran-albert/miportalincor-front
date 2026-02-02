import { useMemo, useState } from "react";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import {
  useDoctorServicesSummary,
  useUpdateDoctorService,
} from "@/hooks/Doctor-Services/useDoctorServices";
import {
  ServiceType,
  ServiceTypeLabels,
  DoctorServicesSummary,
} from "@/types/Doctor-Services/DoctorServices";
import { Doctor } from "@/types/Doctor/Doctor";
import LoadingAnimation from "@/components/Loading/loading";
import { PageHeader } from "@/components/PageHeader";
import { CreditCard, Pill, MessageSquare, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface DoctorWithServices extends Doctor {
  services: DoctorServicesSummary["services"];
}

const DoctorServicesComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { doctors, isLoading: isLoadingDoctors } = useDoctors({
    auth: true,
    fetchDoctors: true,
  });
  const { servicesSummary, isLoading: isLoadingSummary } =
    useDoctorServicesSummary();
  const updateService = useUpdateDoctorService();

  const isLoading = isLoadingDoctors || isLoadingSummary;

  const doctorsWithServices: DoctorWithServices[] = useMemo(() => {
    if (!doctors) return [];

    const summaryMap = new Map<string, DoctorServicesSummary["services"]>();
    for (const summary of servicesSummary) {
      summaryMap.set(summary.doctorUserId, summary.services);
    }

    return doctors.map((doctor) => ({
      ...doctor,
      services: summaryMap.get(doctor.id) || {},
    }));
  }, [doctors, servicesSummary]);

  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctorsWithServices;

    const query = searchQuery.toLowerCase();
    return doctorsWithServices.filter((doctor) => {
      const fullName = `${doctor.lastName}, ${doctor.firstName}`.toLowerCase();
      const specialities =
        doctor.specialities?.map((s) => s.name.toLowerCase()).join(" ") || "";
      return fullName.includes(query) || specialities.includes(query);
    });
  }, [doctorsWithServices, searchQuery]);

  const handleToggle = async (
    doctorUserId: string,
    serviceType: ServiceType,
    currentEnabled: boolean
  ) => {
    try {
      await updateService.mutateAsync({
        doctorUserId,
        serviceType,
        dto: { enabled: !currentEnabled },
      });
      toast.success(
        `${ServiceTypeLabels[serviceType]} ${!currentEnabled ? "habilitado" : "deshabilitado"} correctamente`
      );
    } catch {
      toast.error("Error al actualizar el servicio");
    }
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Administracion" },
    { label: "Servicios Medicos" },
  ];

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Servicios Medicos"
        description="Gestione los servicios pagos habilitados para cada medico"
        icon={<CreditCard className="h-6 w-6" />}
        badge={doctors?.length}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar medico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Medico</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead className="text-center w-[150px]">
                    <div className="flex items-center justify-center gap-2">
                      <Pill className="h-4 w-4 text-green-600" />
                      <span>Carton Verde</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center w-[150px]">
                    <div className="flex items-center justify-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span>WhatsApp Turnos</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-500"
                    >
                      {searchQuery
                        ? "No se encontraron medicos con ese criterio"
                        : "No hay medicos registrados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="font-medium">
                          {doctor.lastName}, {doctor.firstName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Mat. {doctor.matricula}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {doctor.specialities
                          ?.map((s) => s.name)
                          .join(", ") || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={
                              doctor.services[ServiceType.GREEN_CARD]
                                ?.enabled ?? false
                            }
                            onCheckedChange={() =>
                              handleToggle(
                                doctor.id,
                                ServiceType.GREEN_CARD,
                                doctor.services[ServiceType.GREEN_CARD]
                                  ?.enabled ?? false
                              )
                            }
                            disabled={updateService.isPending}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={
                              doctor.services[ServiceType.WHATSAPP_APPOINTMENTS]
                                ?.enabled ?? false
                            }
                            onCheckedChange={() =>
                              handleToggle(
                                doctor.id,
                                ServiceType.WHATSAPP_APPOINTMENTS,
                                doctor.services[
                                  ServiceType.WHATSAPP_APPOINTMENTS
                                ]?.enabled ?? false
                              )
                            }
                            disabled={updateService.isPending}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Mostrando {filteredDoctors.length} de {doctorsWithServices.length}{" "}
            medicos
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorServicesComponent;
