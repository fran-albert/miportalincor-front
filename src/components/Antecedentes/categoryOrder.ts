const ANTECEDENTES_CATEGORY_PRIORITY = [
  "Factores de Riesgo",
  "Cardiovasculares",
  "Endocrino/Metabólicos",
  "Endocrinológicos",
  "Gineco-obstétricos",
] as const;

const ANTECEDENTES_CATEGORY_LAST = ["Otros", "Sin categoría"] as const;

const categoryPriority = new Map<string, number>(
  ANTECEDENTES_CATEGORY_PRIORITY.map((category, index) => [category, index])
);

const categoryLast = new Map<string, number>(
  ANTECEDENTES_CATEGORY_LAST.map((category, index) => [category, index])
);

const collator = new Intl.Collator("es", { sensitivity: "base" });

export const orderAntecedentesCategories = <T>(
  items: readonly T[],
  getCategory: (item: T) => string
): T[] =>
  [...items].sort((left, right) => {
    const leftCategory = getCategory(left);
    const rightCategory = getCategory(right);
    const priorityDiff =
      (categoryPriority.get(leftCategory) ??
        ANTECEDENTES_CATEGORY_PRIORITY.length) -
      (categoryPriority.get(rightCategory) ??
        ANTECEDENTES_CATEGORY_PRIORITY.length);
    if (priorityDiff !== 0) return priorityDiff;
    const lastDiff =
      (categoryLast.get(leftCategory) ?? -1) -
      (categoryLast.get(rightCategory) ?? -1);
    if (lastDiff !== 0) return lastDiff;
    return collator.compare(leftCategory, rightCategory);
  });
