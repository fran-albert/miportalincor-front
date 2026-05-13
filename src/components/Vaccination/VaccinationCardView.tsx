import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Edit,
  Loader2,
  Plus,
  Syringe,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useVaccinationCatalog } from "@/hooks/Vaccination/useVaccinationCard";
import { useVaccinationMutations } from "@/hooks/Vaccination/useVaccinationMutations";
import type {
  VaccinationApplication,
  VaccinationCard,
  VaccinationCardItem,
  VaccinationCardStatus,
} from "@/types/Vaccination/Vaccination";
import { VaccinationApplicationFormModal } from "./VaccinationApplicationFormModal";

interface VaccinationCardViewProps {
  vaccinationCard: VaccinationCard;
  isDoctor?: boolean;
}

const statusMeta: Record<
  VaccinationCardStatus,
  {
    label: string;
    icon: LucideIcon;
    badgeVariant: "success" | "warning" | "destructive" | "secondary";
    textClassName: string;
  }
> = {
  applied: {
    label: "Aplicada",
    icon: CheckCircle2,
    badgeVariant: "success",
    textClassName: "text-green-700",
  },
  pending: {
    label: "Pendiente",
    icon: AlertCircle,
    badgeVariant: "warning",
    textClassName: "text-yellow-700",
  },
  overdue: {
    label: "Vencida",
    icon: AlertCircle,
    badgeVariant: "destructive",
    textClassName: "text-red-700",
  },
  upcoming: {
    label: "Proxima",
    icon: CalendarClock,
    badgeVariant: "secondary",
    textClassName: "text-blue-700",
  },
};

const tabItems: Array<{ value: VaccinationCardStatus | "all"; label: string }> =
  [
    { value: "all", label: "Todas" },
    { value: "overdue", label: "Vencidas" },
    { value: "pending", label: "Pendientes" },
    { value: "upcoming", label: "Proximas" },
    { value: "applied", label: "Aplicadas" },
  ];

const formatDate = (value?: string) => {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

const formatAge = (months?: number | null) => {
  if (months === null || months === undefined) return "-";
  if (months === 0) return "Nacimiento";
  if (months < 12) return `${months} mes${months === 1 ? "" : "es"}`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} anio${years === 1 ? "" : "s"}`;
  }
  return `${years} anio${years === 1 ? "" : "s"} ${remainingMonths} m`;
};

const getDoctorName = (application?: VaccinationApplication) => {
  if (!application?.doctor) return "-";
  return `${application.doctor.firstName} ${application.doctor.lastName}`;
};

export function VaccinationCardView({
  vaccinationCard,
  isDoctor = false,
}: VaccinationCardViewProps) {
  const [activeTab, setActiveTab] = useState<VaccinationCardStatus | "all">(
    "all"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<VaccinationApplication | null>(null);
  const [initialScheduleRuleId, setInitialScheduleRuleId] = useState<
    string | undefined
  >();
  const [applicationToDelete, setApplicationToDelete] =
    useState<VaccinationApplication | null>(null);

  const canAddApplications =
    isDoctor && vaccinationCard.canAddApplications === true;
  const { catalog, isLoading: isLoadingCatalog } =
    useVaccinationCatalog(canAddApplications);
  const { deleteApplicationMutation } = useVaccinationMutations();
  const { showSuccess, showError } = useToastContext();

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return vaccinationCard.items;
    return vaccinationCard.items.filter((item) => item.status === activeTab);
  }, [activeTab, vaccinationCard.items]);

  const openCreateModal = (scheduleRuleId?: string) => {
    setSelectedApplication(null);
    setInitialScheduleRuleId(scheduleRuleId);
    setIsFormOpen(true);
  };

  const openEditModal = (application: VaccinationApplication) => {
    setSelectedApplication(application);
    setInitialScheduleRuleId(undefined);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setSelectedApplication(null);
    setInitialScheduleRuleId(undefined);
  };

  const handleConfirmDelete = async () => {
    if (!applicationToDelete) return;

    try {
      await deleteApplicationMutation.mutateAsync({
        applicationId: applicationToDelete.id,
      });
      showSuccess("Vacuna eliminada correctamente");
      setApplicationToDelete(null);
    } catch {
      showError("Error al eliminar la vacuna");
    }
  };

  const renderStatusBadge = (status: VaccinationCardStatus) => {
    const meta = statusMeta[status];
    const Icon = meta.icon;

    return (
      <Badge variant={meta.badgeVariant} className="gap-1 whitespace-nowrap">
        <Icon className="h-3 w-3" />
        {meta.label}
      </Badge>
    );
  };

  const renderActionCell = (item: VaccinationCardItem) => {
    const application = item.application;

    if (isDoctor && application?.canEdit) {
      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            aria-label={`Editar ${item.vaccine.name} ${item.doseLabel}`}
            onClick={() => openEditModal(application)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            aria-label={`Eliminar ${item.vaccine.name} ${item.doseLabel}`}
            onClick={() => setApplicationToDelete(application)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (canAddApplications && !application) {
      return (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-green-200 text-green-700 hover:bg-green-50"
            onClick={() => openCreateModal(item.scheduleRuleId)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Cargar
          </Button>
        </div>
      );
    }

    return <span className="text-sm text-gray-400">-</span>;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border-green-100 bg-green-50/60">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-700">Aplicadas</p>
            <p className="text-2xl font-bold text-green-900">
              {vaccinationCard.counts.applied}
            </p>
          </CardContent>
        </Card>
        <Card className="border-yellow-100 bg-yellow-50/60">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-yellow-700">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-900">
              {vaccinationCard.counts.pending}
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-100 bg-red-50/60">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-700">Vencidas</p>
            <p className="text-2xl font-bold text-red-900">
              {vaccinationCard.counts.overdue}
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 bg-blue-50/60">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-700">Proximas</p>
            <p className="text-2xl font-bold text-blue-900">
              {vaccinationCard.counts.upcoming}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Syringe className="h-5 w-5 text-green-600" />
              Carnet de vacunacion
            </CardTitle>
            {canAddApplications && (
              <Button
                onClick={() => openCreateModal()}
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoadingCatalog}
              >
                {isLoadingCatalog ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Cargar vacuna
              </Button>
            )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as VaccinationCardStatus | "all")
            }
          >
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1">
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="min-w-[96px] flex-1"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Estado</TableHead>
                  <TableHead>Vacuna</TableHead>
                  <TableHead>Dosis</TableHead>
                  <TableHead className="w-28">Edad</TableHead>
                  <TableHead className="w-32">Recomendada</TableHead>
                  <TableHead className="w-32">Aplicada</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead className="w-24 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-gray-500"
                    >
                      No hay vacunas para el filtro seleccionado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.scheduleRuleId}>
                      <TableCell>{renderStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {item.vaccine.name}
                        </div>
                        {item.notes && (
                          <div className="mt-1 max-w-[260px] text-xs text-gray-500">
                            {item.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {item.doseLabel}
                      </TableCell>
                      <TableCell>{formatAge(item.recommendedAgeMonths)}</TableCell>
                      <TableCell>{formatDate(item.recommendedDate)}</TableCell>
                      <TableCell>
                        <div className={statusMeta[item.status].textClassName}>
                          {formatDate(item.application?.appliedDate)}
                        </div>
                        {item.application?.doctor && (
                          <div className="mt-1 text-xs text-gray-500">
                            {getDoctorName(item.application)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[260px] text-sm text-gray-600">
                        {item.application?.observations || "-"}
                      </TableCell>
                      <TableCell>{renderActionCell(item)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <VaccinationApplicationFormModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        patientUserId={vaccinationCard.patientUserId}
        catalog={catalog}
        application={selectedApplication}
        initialScheduleRuleId={initialScheduleRuleId}
      />

      <AlertDialog
        open={Boolean(applicationToDelete)}
        onOpenChange={(open) => {
          if (!open) setApplicationToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar vacuna aplicada</AlertDialogTitle>
            <AlertDialogDescription>
              El registro dejara de verse en el carnet de vacunacion del
              paciente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
