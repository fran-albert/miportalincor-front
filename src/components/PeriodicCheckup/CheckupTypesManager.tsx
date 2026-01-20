import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Plus, MoreHorizontal, Pencil, Trash2, CalendarClock } from "lucide-react";
import { useCheckupTypes, useDeleteCheckupType } from "@/hooks/Periodic-Checkup";
import { CheckupType } from "@/types/Periodic-Checkup/PeriodicCheckup";
import { CheckupTypeDialog } from "./CheckupTypeDialog";
import { useToastContext } from "@/hooks/Toast/toast-context";

export function CheckupTypesManager() {
  const { checkupTypes, isLoading } = useCheckupTypes();
  const { mutateAsync: deleteCheckupType, isPending: isDeleting } = useDeleteCheckupType();
  const { showSuccess, showError } = useToastContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CheckupType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<CheckupType | null>(null);

  const handleEdit = (type: CheckupType) => {
    setSelectedType(type);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedType(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;

    try {
      await deleteCheckupType(typeToDelete.id);
      showSuccess("Tipo de chequeo eliminado");
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
    } catch (error) {
      showError("Error al eliminar el tipo de chequeo");
    }
  };

  const confirmDelete = (type: CheckupType) => {
    setTypeToDelete(type);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Tipos de Chequeos Periódicos
          </CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Tipo
          </Button>
        </CardHeader>
        <CardContent>
          {checkupTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarClock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay tipos de chequeo configurados</p>
              <Button variant="link" onClick={handleCreate}>
                Crear el primer tipo
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Recordatorios</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkupTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{type.name}</p>
                        {type.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {type.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{type.specialityName || "-"}</TableCell>
                    <TableCell>Cada {type.frequencyMonths} meses</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {type.reminderDays.map((day) => (
                          <Badge key={day} variant="secondary" className="text-xs">
                            {day} días
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.isActive ? "default" : "secondary"}>
                        {type.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(type)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => confirmDelete(type)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CheckupTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        checkupType={selectedType}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tipo de chequeo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar el tipo de chequeo{" "}
              <strong>{typeToDelete?.name}</strong>? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
