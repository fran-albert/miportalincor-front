import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DoctorDashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      {/* Module cards skeleton - matching new ModuleCard design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden h-full">
            <CardHeader>
              {/* Icon and arrow row */}
              <div className="flex items-start justify-between mb-3">
                <Skeleton className="h-16 w-16 rounded-xl" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              {/* Title */}
              <Skeleton className="h-6 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              {/* Description */}
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para la tarjeta completa de estudios (incluye encabezado y tabla)
 */
export const StudiesCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Encabezado de la tarjeta */}
      <div className="p-4 border-b animate-pulse">
        <div className="flex items-center">
          <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="animate-pulse">
          {/* Filtros */}
          <div className="flex gap-2 mb-4">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>

          {/* Encabezado de la tabla */}
          <div className="h-12 bg-gray-200 rounded w-full mb-2"></div>

          {/* Filas de la tabla */}
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="h-16 bg-gray-200 rounded w-full mb-2"
                style={{ opacity: 1 - index * 0.15 }}
              ></div>
            ))}

          {/* Paginación */}
          <div className="flex justify-between mt-4">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
