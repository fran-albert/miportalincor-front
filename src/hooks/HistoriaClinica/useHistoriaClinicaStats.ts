import { useMemo } from "react";
import {
  AntecedentesResponse,
  EvolucionesResponse,
  MedicacionActualResponse,
} from "@/types/Antecedentes/Antecedentes";

interface UseHistoriaClinicaStatsProps {
  antecedentes: AntecedentesResponse | undefined;
  evoluciones: EvolucionesResponse | undefined;
  medicacionActual: MedicacionActualResponse | undefined;
}

export const useHistoriaClinicaStats = ({
  antecedentes,
  evoluciones,
  medicacionActual,
}: UseHistoriaClinicaStatsProps) => {
  const stats = useMemo(() => {
    // Total de evoluciones
    const totalEvoluciones = evoluciones?.evoluciones?.length || 0;

    // Última evolución
    const lastEvolucion =
      evoluciones?.evoluciones && evoluciones.evoluciones.length > 0
        ? evoluciones.evoluciones[0]
        : null;

    // Total de antecedentes
    const totalAntecedentes = antecedentes?.antecedentes?.length || 0;

    // Agrupar antecedentes por categoría
    const antecedentesPorCategoria: Record<string, number> = {};
    antecedentes?.antecedentes?.forEach((antecedente) => {
      const categoria = antecedente.dataType?.category || "Sin categoría";
      antecedentesPorCategoria[categoria] =
        (antecedentesPorCategoria[categoria] || 0) + 1;
    });

    // Total de medicación activa
    const totalMedicacionActiva = Array.isArray(medicacionActual)
      ? medicacionActual.filter((med) => med.status === "ACTIVE").length
      : 0;

    // Último médico que atendió
    const lastDoctor = lastEvolucion?.doctor || null;

    return {
      totalEvoluciones,
      lastEvolucion,
      totalAntecedentes,
      antecedentesPorCategoria,
      totalMedicacionActiva,
      lastDoctor,
    };
  }, [antecedentes, evoluciones, medicacionActual]);

  return stats;
};
