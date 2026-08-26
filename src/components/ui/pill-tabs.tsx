import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * El patrón de pestañas del portal: pastilla blanca con borde, verde
 * institucional cuando está activa, y el contador en un badge que invierte los
 * colores para seguir leyéndose sobre el verde.
 *
 * Estaba suelto en "Estudios recibidos" como una cadena de clases larguísima.
 * Al construir "Sin asignar" se copió a medias —quedó el badge sin la inversión,
 * ilegible sobre la pestaña activa—, así que el patrón vive acá y las
 * pantallas lo usan en vez de repetir clases.
 */
const PILL_TRIGGER_CLASSES =
  "group gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-greenPrimary/40 hover:text-greenPrimary data-[state=active]:border-greenPrimary data-[state=active]:bg-greenPrimary data-[state=active]:text-white data-[state=active]:shadow";

/**
 * `group-data-[state=active]:` es lo que hace legible el contador: sin eso el
 * badge queda gris claro sobre el verde de la pestaña activa.
 */
const PILL_COUNT_CLASSES =
  "h-5 min-w-5 justify-center rounded-full bg-gray-100 px-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 group-data-[state=active]:bg-white group-data-[state=active]:text-greenPrimary";

const PILL_LIST_CLASSES =
  "h-auto flex-wrap justify-start gap-2 bg-transparent p-0";

const PillTabsList = React.forwardRef<
  React.ElementRef<typeof TabsList>,
  React.ComponentPropsWithoutRef<typeof TabsList>
>(({ className, ...props }, ref) => (
  <TabsList ref={ref} className={cn(PILL_LIST_CLASSES, className)} {...props} />
));
PillTabsList.displayName = "PillTabsList";

interface PillTabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsTrigger> {
  /** Cuántos ítems pendientes tiene la pestaña. En 0 no se muestra nada. */
  count?: number;
}

const PillTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsTrigger>,
  PillTabsTriggerProps
>(({ className, count = 0, children, ...props }, ref) => (
  <TabsTrigger
    ref={ref}
    className={cn(PILL_TRIGGER_CLASSES, className)}
    {...props}
  >
    {children}
    {count > 0 && <Badge className={PILL_COUNT_CLASSES}>{count}</Badge>}
  </TabsTrigger>
));
PillTabsTrigger.displayName = "PillTabsTrigger";

export { PillTabsList, PillTabsTrigger };
