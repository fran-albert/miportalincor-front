import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AntecedentesSkeleton() {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {[...Array(3)].map((_, categoryIndex) => (
            <div key={categoryIndex} className="space-y-2">
              <Skeleton className="h-4 w-32 border-b" />
              <div className="space-y-1 ml-2">
                {[...Array(2)].map((_, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center gap-2 py-1 px-2"
                  >
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function EvolucionesSkeleton() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="border-l-4 border-greenPrimary pl-4 py-3 bg-white rounded-r-lg shadow-sm border"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MedicacionSkeleton() {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HistoriaClinicaSkeleton() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Sección de Antecedentes y Evoluciones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AntecedentesSkeleton />
          <EvolucionesSkeleton />
        </div>

        {/* Medicación */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MedicacionSkeleton />
          <div className="lg:col-span-2">
            {/* Espacio vacío para mantener el layout */}
          </div>
        </div>
      </div>
    </div>
  );
}