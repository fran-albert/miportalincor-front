import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DoctorCardSkeleton() {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
    </Card>
  );
}
export function DoctorModulesSkeleton() {
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

export function DoctorDashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <DoctorCardSkeleton />
      <DoctorModulesSkeleton />
    </div>
  );
}

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

export const DoctorProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-48"></div>
        <div className="h-6 bg-gray-200 rounded w-96"></div>
      </div>

      {/* Avatar Card skeleton */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        <div className="p-6 pt-20 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-5 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
      </div>

      {/* 6 Sectional Cards skeletons */}
      {[...Array(6)].fill(0).map((_, i) => (
        <div key={i} className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b animate-pulse">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {[...Array(4)].fill(0).map((_, j) => (
                <div
                  key={j}
                  className="h-10 bg-gray-200 rounded w-full animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
