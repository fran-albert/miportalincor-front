import { useState, useMemo } from "react";
import { toast } from "sonner";
import { UserCog, Plus, Trash2, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { PageHeader } from "@/components/PageHeader";
import {
  usePrescriptionCenters,
  usePrescriptionCenterOperators,
  useAddOperator,
  useRemoveOperator,
} from "@/hooks/Prescription-Center/usePrescriptionCenter";
import { useSecretaries } from "@/hooks/Secretary/useSecretaries";
import { formatDateArgentina } from "@/common/helpers/helpers";
import type { PrescriptionCenterOperator } from "@/types/Prescription-Center/Prescription-Center";

export default function OperatorManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [removeTarget, setRemoveTarget] = useState<PrescriptionCenterOperator | null>(null);

  const { data: centers, isLoading: centersLoading } = usePrescriptionCenters();
  const centerId = centers?.[0]?.id ?? "";
  const centerName = centers?.[0]?.name ?? "Centro de Recetas";

  const {
    data: operators = [],
    isLoading: operatorsLoading,
  } = usePrescriptionCenterOperators(centerId);

  const { secretaries, isLoading: secretariesLoading } = useSecretaries({
    auth: true,
    fetchSecretaries: true,
  });

  const addOperator = useAddOperator();
  const removeOperator = useRemoveOperator();

  const filteredOperators = useMemo(() => {
    if (!searchQuery.trim()) return operators;
    const query = searchQuery.toLowerCase();
    return operators.filter((op) => {
      const fullName = `${op.firstName} ${op.lastName}`.toLowerCase();
      return fullName.includes(query) || op.email?.toLowerCase().includes(query);
    });
  }, [operators, searchQuery]);

  // Secretarias que NO son operadores actualmente
  const availableSecretaries = useMemo(() => {
    const operatorUserIds = new Set(operators.map((op) => op.userId));
    return secretaries.filter((s) => !operatorUserIds.has(s.id));
  }, [secretaries, operators]);

  const handleAdd = async () => {
    if (!selectedUserId || !centerId) return;
    try {
      await addOperator.mutateAsync({ centerId, userId: selectedUserId });
      toast.success("Operador agregado correctamente");
      setAddDialogOpen(false);
      setSelectedUserId("");
    } catch {
      toast.error("Error al agregar operador");
    }
  };

  const handleRemove = async () => {
    if (!removeTarget || !centerId) return;
    try {
      await removeOperator.mutateAsync({
        centerId,
        userId: removeTarget.userId,
      });
      toast.success("Operador removido correctamente");
      setRemoveTarget(null);
    } catch {
      toast.error("Error al remover operador");
    }
  };

  const isLoading = centersLoading || operatorsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbItems={[
          { label: "Inicio", href: "/inicio" },
          { label: "Operadores de Recetas" },
        ]}
        title="Operadores de Recetas"
        description={`Gestionar las secretarias asignadas como operadoras del ${centerName}`}
        icon={<UserCog className="h-6 w-6" />}
        badge={operators.length}
        actions={
          <Button onClick={() => setAddDialogOpen(true)} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Operador
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">Operadores asignados</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar operador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredOperators.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">
                {searchQuery
                  ? "No se encontraron operadores con esa búsqueda"
                  : "No hay operadores asignados. Agregá una secretaria como operadora."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Asignado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperators.map((operator) => (
                  <TableRow key={operator.id}>
                    <TableCell className="font-medium">
                      {operator.lastName}, {operator.firstName}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {operator.email || "-"}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDateArgentina(operator.assignedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setRemoveTarget(operator)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog para agregar operador */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Operador</DialogTitle>
            <DialogDescription>
              Seleccioná una secretaria para asignarla como operadora del centro
              de recetas.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar secretaria..." />
              </SelectTrigger>
              <SelectContent>
                {secretariesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : availableSecretaries.length === 0 ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    Todas las secretarias ya son operadoras
                  </div>
                ) : (
                  availableSecretaries.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id}>
                      {sec.lastName}, {sec.firstName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setSelectedUserId("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!selectedUserId || addOperator.isPending}
            >
              {addOperator.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert para confirmar eliminación */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover operador</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que querés remover a{" "}
              <span className="font-medium">
                {removeTarget?.firstName} {removeTarget?.lastName}
              </span>{" "}
              como operador del centro de recetas? Ya no podrá gestionar
              solicitudes de recetas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeOperator.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
