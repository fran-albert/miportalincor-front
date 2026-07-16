import { ConfirmStudyInboxGroup } from "@/types/StudyInbox/StudyInbox.types";

export type SplitGroupKey = "A" | "B";

export interface SplitState {
  /** A qué grupo (A/B) está asignada cada imagen. Todas asignadas siempre. */
  assignment: Record<string, SplitGroupKey>;
  notes: Record<SplitGroupKey, string>;
  /** Grupo que se lleva el informe (solo relevante si el item tiene informe). */
  reportGroup: SplitGroupKey;
}

const GROUPS: SplitGroupKey[] = ["A", "B"];

/** instanceIds asignados a un grupo, en el orden original del estudio. */
export const instancesOfGroup = (
  instanceIds: string[],
  assignment: Record<string, SplitGroupKey>,
  group: SplitGroupKey,
): string[] => instanceIds.filter((id) => assignment[id] === group);

/**
 * Valida el split y devuelve un mensaje de error, o null si está listo para
 * confirmar. Reglas: cada grupo con ≥1 imagen y una nota; si hay informe,
 * exactamente el grupo elegido se lo lleva (lo garantiza el reportGroup).
 */
export const validateSplit = (
  instanceIds: string[],
  state: SplitState,
): string | null => {
  for (const group of GROUPS) {
    const imgs = instancesOfGroup(instanceIds, state.assignment, group);
    if (imgs.length === 0) {
      return `El estudio ${group} no tiene imágenes asignadas.`;
    }
    if (!state.notes[group]?.trim()) {
      return `Falta el tipo/nota del estudio ${group}.`;
    }
  }
  return null;
};

/** Arma el payload de grupos para el confirm a partir del estado del split. */
export const buildSplitGroups = (
  instanceIds: string[],
  state: SplitState,
  hasReport: boolean,
): ConfirmStudyInboxGroup[] =>
  GROUPS.map((group) => ({
    instanceIds: instancesOfGroup(instanceIds, state.assignment, group),
    note: state.notes[group].trim(),
    includeReport: hasReport && state.reportGroup === group,
  }));
