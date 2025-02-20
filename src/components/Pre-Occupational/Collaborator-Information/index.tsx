import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

export default function CollaboratorInformationCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <h2 className="text-lg font-semibold">Información del colaborador</h2>
        <Button variant="ghost" size="icon">
          <ChevronLeft className="h-4 w-4 rotate-270" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Nombre:</div>
            <div>Crocci, Franco Ezequiel</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">DNI:</div>
            <div>39337877</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Sexo:</div>
            <div>Masculino</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Fecha de Nac.:</div>
            <div>n/d</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Edad:</div>
            <div>n/d</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Email:</div>
            <div>n/d</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Celular:</div>
            <div>n/d</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Lugar de trabajo:</div>
            <div>trabajos en altura</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Empresa:</div>
            <div>STI</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
