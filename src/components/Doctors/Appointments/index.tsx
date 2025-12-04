import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  doctorId: number;
}

const DoctorAppointments = ({ doctorId: _doctorId }: Props) => {
  // Funcionalidad temporalmente deshabilitada - Coming Soon
  return (
    <div>
      <Card className="border-dashed border-2 border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-500">
              <CalendarIcon className="h-5 w-5" />
              Turnos Recientes
            </CardTitle>
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
              Próximamente
            </Badge>
          </div>
          <CardDescription>
            Esta funcionalidad estará disponible próximamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              La gestión de turnos y citas del médico estará disponible muy pronto.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAppointments;
