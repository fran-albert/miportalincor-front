import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  ProgramEnrollment,
  EnrollmentStatusLabels,
  EnrollmentStatusColors,
} from "@/types/Program/ProgramEnrollment";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MyProgramCardProps {
  enrollment: ProgramEnrollment;
}

export default function MyProgramCard({ enrollment }: MyProgramCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {enrollment.program?.name ?? "Programa"}
          </CardTitle>
          <Badge className={EnrollmentStatusColors[enrollment.status]}>
            {EnrollmentStatusLabels[enrollment.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Inscripto el{" "}
            {format(new Date(enrollment.enrolledAt), "dd/MM/yyyy", {
              locale: es,
            })}
          </p>
          <Link to={`/mis-programas/${enrollment.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              Ver detalle
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
