import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Power,
  Trash2,
  FileText,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";
import { GreenCard, GreenCardItem } from "@/types/Green-Card/GreenCard";
import { GreenCardItemFormModal } from "./GreenCardItemFormModal";
import { RequestPrescriptionModal } from "./RequestPrescriptionModal";
import { useGreenCardMutations } from "@/hooks/Green-Card/useGreenCardMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GreenCardViewProps {
  greenCard: GreenCard;
  isDoctor?: boolean;
  isPatient?: boolean;
}

// Helper to get doctor display name
const getDoctorName = (item: GreenCardItem) => {
  if (!item.doctor) return "Médico";
  const prefix = item.doctor.gender === "Femenino" ? "Dra." : "Dr.";
  return `${prefix} ${item.doctor.lastName}`;
};

const getDoctorFullName = (item: GreenCardItem) => {
  if (!item.doctor) return "Médico";
  const prefix = item.doctor.gender === "Femenino" ? "Dra." : "Dr.";
  return `${prefix} ${item.doctor.firstName} ${item.doctor.lastName}`;
};

export function GreenCardView({
  greenCard,
  isDoctor = false,
  isPatient = false,
}: GreenCardViewProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GreenCardItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GreenCardItem | null>(null);

  const {
    toggleItemMutation,
    deleteItemMutation,
  } = useGreenCardMutations();
  const { showSuccess, showError } = useToastContext();

  // Doctor can add items if canAddItems is true
  const canAddItems = greenCard.canAddItems && isDoctor;

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  const handleEditItem = (item: GreenCardItem) => {
    setSelectedItem(item);
    setIsFormModalOpen(true);
  };

  const handleToggleItem = async (item: GreenCardItem) => {
    try {
      await toggleItemMutation.mutateAsync({
        cardId: greenCard.id,
        itemId: item.id,
      });
      showSuccess(
        `Medicación ${item.isActive ? "suspendida" : "reactivada"} correctamente`
      );
    } catch {
      showError("Error al cambiar el estado de la medicación");
    }
  };

  const handleDeleteClick = (item: GreenCardItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItemMutation.mutateAsync({
        cardId: greenCard.id,
        itemId: itemToDelete.id,
      });
      showSuccess("Medicación eliminada correctamente");
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      showError("Error al eliminar la medicación");
    }
  };

  const handleRequestPrescription = (item: GreenCardItem) => {
    setSelectedItem(item);
    setIsPrescriptionModalOpen(true);
  };

  // Group items by schedule
  const scheduleOrder = [
    "Ayuno",
    "Desayuno",
    "08:00",
    "10:00",
    "12:00",
    "Almuerzo",
    "14:00",
    "16:00",
    "18:00",
    "Merienda",
    "20:00",
    "Cena",
    "22:00",
    "Antes de dormir",
    "Otros",
  ];

  const groupedItems = greenCard.items.reduce((acc, item) => {
    const schedule = item.schedule || "Otros";
    if (!acc[schedule]) {
      acc[schedule] = [];
    }
    acc[schedule].push(item);
    return acc;
  }, {} as Record<string, GreenCardItem[]>);

  // Sort schedules
  const sortedSchedules = Object.keys(groupedItems).sort((a, b) => {
    const indexA = scheduleOrder.indexOf(a);
    const indexB = scheduleOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const activeMedications = greenCard.items.filter((item) => item.isActive);
  const suspendedMedications = greenCard.items.filter((item) => !item.isActive);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Active Medications */}
        {activeMedications.length > 0 ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Medicación Activa
                  <Badge variant="success" className="ml-2">
                    {activeMedications.length}
                  </Badge>
                </CardTitle>
                {canAddItems && (
                  <Button
                    onClick={handleAddItem}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Horario</TableHead>
                      <TableHead>Medicamento</TableHead>
                      <TableHead className="w-20">Dosis</TableHead>
                      <TableHead className="w-24">Cantidad</TableHead>
                      <TableHead className="w-32">Médico</TableHead>
                      <TableHead>Observaciones</TableHead>
                      <TableHead className="w-40">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSchedules.map((schedule) => {
                      const scheduleItems = groupedItems[schedule]?.filter(
                        (item) => item.isActive
                      ) || [];
                      if (scheduleItems.length === 0) return null;

                      return scheduleItems.map((item, idx) => (
                        <TableRow key={item.id}>
                          {idx === 0 && (
                            <TableCell
                              rowSpan={scheduleItems.length}
                              className="font-medium text-green-700 bg-green-50 align-top"
                            >
                              {schedule}
                            </TableCell>
                          )}
                          <TableCell className="font-medium">
                            {item.medicationName}
                          </TableCell>
                          <TableCell>{item.dosage}</TableCell>
                          <TableCell>{item.quantity || "-"}</TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-sm text-gray-600 cursor-help">
                                  <Stethoscope className="h-3 w-3" />
                                  <span className="truncate max-w-[100px]">
                                    {getDoctorName(item)}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getDoctorFullName(item)}</p>
                                {item.doctor?.specialities && item.doctor.specialities.length > 0 && (
                                  <p className="text-xs text-gray-400">
                                    {item.doctor.specialities[0]}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-gray-500 text-sm">
                            {item.notes || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {isPatient && (
                                item.hasPendingPrescription ? (
                                  <Badge variant="warning" className="text-xs">
                                    Pendiente
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRequestPrescription(item)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    Pedir
                                  </Button>
                                )
                              )}
                              {isDoctor && item.canEdit && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditItem(item)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleItem(item)}
                                    className="text-orange-600 hover:text-orange-700 h-8 w-8 p-0"
                                  >
                                    <Power className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(item)}
                                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ));
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-1">
                No hay medicamentos activos
              </p>
              {canAddItems && (
                <>
                  <p className="text-gray-400 text-sm mb-4">
                    Agregá medicamentos a este cartón
                  </p>
                  <Button
                    onClick={handleAddItem}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Medicamento
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Suspended Medications */}
        {suspendedMedications.length > 0 && (
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Medicación Suspendida
                <Badge variant="warning" className="ml-2">
                  {suspendedMedications.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Horario</TableHead>
                      <TableHead>Medicamento</TableHead>
                      <TableHead className="w-20">Dosis</TableHead>
                      <TableHead className="w-32">Médico</TableHead>
                      {isDoctor && <TableHead className="w-24">Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspendedMedications.map((item) => (
                      <TableRow key={item.id} className="opacity-60">
                        <TableCell className="font-medium text-gray-500">
                          {item.schedule}
                        </TableCell>
                        <TableCell className="font-medium line-through text-gray-500">
                          {item.medicationName}
                        </TableCell>
                        <TableCell className="line-through text-gray-500">
                          {item.dosage}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Stethoscope className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">
                              {getDoctorName(item)}
                            </span>
                          </div>
                        </TableCell>
                        {isDoctor && item.canEdit && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleItem(item)}
                                className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
                                title="Reactivar"
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(item)}
                                className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <GreenCardItemFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedItem(null);
          }}
          greenCardId={greenCard.id}
          item={selectedItem}
        />

        {selectedItem && (
          <RequestPrescriptionModal
            isOpen={isPrescriptionModalOpen}
            onClose={() => {
              setIsPrescriptionModalOpen(false);
              setSelectedItem(null);
            }}
            greenCardId={greenCard.id}
            item={selectedItem}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro que desea eliminar el medicamento "
                {itemToDelete?.medicationName}"? Esta acción no se puede deshacer.
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
    </TooltipProvider>
  );
}
