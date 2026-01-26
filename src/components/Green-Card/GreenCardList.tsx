import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, FileText, Pill, Calendar, ChevronRight, Loader2, Stethoscope } from "lucide-react";
import { GreenCard } from "@/types/Green-Card/GreenCard";
import { formatDateArgentina } from "@/common/helpers/helpers";

interface GreenCardListProps {
  greenCards: GreenCard[];
  onSelectCard: (cardId: string) => void;
  isLoading?: boolean;
}

// Helper to get unique doctors from items
const getUniqueDoctors = (card: GreenCard) => {
  const doctorsMap = new Map<string, { firstName: string; lastName: string; specialities?: string[] }>();
  card.items.forEach((item) => {
    if (item.doctor && !doctorsMap.has(item.doctorUserId)) {
      doctorsMap.set(item.doctorUserId, {
        firstName: item.doctor.firstName,
        lastName: item.doctor.lastName,
        specialities: item.doctor.specialities,
      });
    }
  });
  return Array.from(doctorsMap.values());
};

export function GreenCardList({
  greenCards,
  onSelectCard,
  isLoading = false,
}: GreenCardListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando cartones verdes...</p>
        </CardContent>
      </Card>
    );
  }

  if (greenCards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">
            No hay cartones verdes disponibles
          </p>
          <p className="text-gray-400 text-sm">
            Los médicos pueden crear cartones verdes con tu medicación habitual
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {greenCards.map((card) => {
        const uniqueDoctors = getUniqueDoctors(card);
        
        return (
          <Card
            key={card.id}
            className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-600"
            onClick={() => onSelectCard(card.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  {card.patient && (
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-lg">
                        {card.patient.firstName} {card.patient.lastName}
                      </CardTitle>
                    </div>
                  )}
                  {uniqueDoctors.length > 0 && (
                    <div className="flex items-center gap-2 ml-7 text-sm text-gray-500">
                      <Stethoscope className="h-4 w-4" />
                      <span>
                        {uniqueDoctors.length} médico{uniqueDoctors.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  Ver detalles
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Stats */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">
                      {card.activeItemsCount} medicamento{card.activeItemsCount !== 1 ? "s" : ""} activo{card.activeItemsCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {card.totalItemsCount > card.activeItemsCount && (
                    <Badge variant="warning" className="text-xs">
                      {card.totalItemsCount - card.activeItemsCount} suspendido{card.totalItemsCount - card.activeItemsCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                {/* Preview of active medications */}
                {card.items.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Medicamentos
                    </div>
                    <div className="space-y-1">
                      {card.items
                        .filter((item) => item.isActive)
                        .slice(0, 3)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded"
                          >
                            <Badge variant="outline" className="text-xs font-normal">
                              {item.schedule}
                            </Badge>
                            <span className="font-medium text-gray-900">
                              {item.medicationName}
                            </span>
                            <span className="text-gray-500">- {item.dosage}</span>
                          </div>
                        ))}
                      {card.items.filter((item) => item.isActive).length > 3 && (
                        <div className="text-xs text-gray-500 ml-2">
                          +{card.items.filter((item) => item.isActive).length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Last updated */}
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Última actualización: {formatDateArgentina(String(card.updatedAt))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
