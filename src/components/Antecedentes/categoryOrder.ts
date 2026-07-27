const ANTECEDENTES_CATEGORY_PRIORITY = [
  "Factores de Riesgo",
  "Cardiovasculares",
] as const;

const categoryPriority = new Map<string, number>(
  ANTECEDENTES_CATEGORY_PRIORITY.map((category, index) => [category, index])
);

export const orderAntecedentesCategories = <T>(
  items: readonly T[],
  getCategory: (item: T) => string
): T[] =>
  items
    .map((item, originalIndex) => ({
      item,
      originalIndex,
      priority:
        categoryPriority.get(getCategory(item)) ?? Number.MAX_SAFE_INTEGER,
    }))
    .sort(
      (left, right) =>
        left.priority - right.priority ||
        left.originalIndex - right.originalIndex
    )
    .map(({ item }) => item);
