import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, HeartPulse } from "lucide-react";
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
    <Card className="group overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-greenPrimary/5 to-teal-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-greenPrimary to-teal-600 p-2.5 text-white shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg text-slate-900 transition-colors group-hover:text-greenPrimary">
                {enrollment.programName ?? "Programa"}
              </CardTitle>
              <p className="text-sm text-slate-500">Seguimiento de tu programa</p>
            </div>
          </div>

          <Badge className={EnrollmentStatusColors[enrollment.status]}>
            {EnrollmentStatusLabels[enrollment.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <span>Desde</span>
          <span className="font-medium text-slate-900">
            {format(new Date(enrollment.enrolledAt), "dd/MM/yyyy", {
              locale: es,
            })}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to={`/mis-programas/${enrollment.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-greenPrimary/20 text-greenPrimary hover:bg-greenPrimary/5 hover:text-greenPrimary sm:w-auto"
            >
              Ver mi programa
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
