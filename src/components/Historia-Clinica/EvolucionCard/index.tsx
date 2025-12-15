import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Evolucion } from "@/types/Antecedentes/Antecedentes";
import { motion } from "framer-motion";
import { Clock, Stethoscope } from "lucide-react";
import { formatDoctorName } from "@/common/helpers/helpers";

interface EvolucionCardProps {
  evolucion: Evolucion;
  index: number;
}

export const EvolucionCard = ({ evolucion, index }: EvolucionCardProps) => {
  const doctorInitials = `${evolucion.doctor.firstName?.[0] || ""}${
    evolucion.doctor.lastName?.[0] || ""
  }`.toUpperCase();

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="relative"
    >
      {/* Timeline line */}
      <div className="absolute left-[22px] top-12 bottom-0 w-0.5 bg-gray-200 -z-10" />

      {/* Timeline dot */}
      <div className="absolute left-[14px] top-8 w-5 h-5 rounded-full bg-greenPrimary border-4 border-white shadow-md" />

      <Card className="ml-12 shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-greenPrimary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Doctor Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-greenPrimary to-teal-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">
                  {doctorInitials}
                </span>
              </div>

              {/* Doctor Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">
                    {formatDoctorName(evolucion.doctor)}
                  </h3>
                  {evolucion.doctor.specialities &&
                    evolucion.doctor.specialities.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-greenPrimary/10 text-greenPrimary border-greenPrimary/20"
                      >
                        <Stethoscope className="h-3 w-3 mr-1" />
                        {evolucion.doctor.specialities[0].name}
                      </Badge>
                    )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(evolucion.createdAt)}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span>{getRelativeTime(evolucion.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {evolucion.data && evolucion.data.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {evolucion.data.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="border-b-0"
                >
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="text-greenPrimary">
                        {item.dataType?.name || "Sin categoría"}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="space-y-2 pl-4">
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Valor:</span> {item.value}
                      </div>
                      {item.observaciones && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-medium">Observaciones:</span>{" "}
                          {item.observaciones}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Sin datos registrados en esta evolución
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
