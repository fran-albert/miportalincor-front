import { describe, expect, it } from "vitest";
import { orderAntecedentesCategories } from "./categoryOrder";

const order = (categories: string[]) =>
  orderAntecedentesCategories(categories, (category) => category);

describe("orderAntecedentesCategories", () => {
  it("prioriza FR, CV, Endocrinos y Gineco-obstétricos en ese orden", () => {
    expect(
      order([
        "Renales",
        "Gineco-obstétricos",
        "Cardiovasculares",
        "Endocrinológicos",
        "Gastrointestinales",
        "Endocrino/Metabólicos",
        "Factores de Riesgo",
      ])
    ).toEqual([
      "Factores de Riesgo",
      "Cardiovasculares",
      "Endocrino/Metabólicos",
      "Endocrinológicos",
      "Gineco-obstétricos",
      "Gastrointestinales",
      "Renales",
    ]);
  });

  it("ordena el resto alfabéticamente sin importar el orden de llegada", () => {
    expect(
      order([
        "Urológicos",
        "Neurológicos",
        "Dermatológicos",
        "Hematológicos",
        "Oncológicos",
      ])
    ).toEqual([
      "Dermatológicos",
      "Hematológicos",
      "Neurológicos",
      "Oncológicos",
      "Urológicos",
    ]);
  });

  it("deja Otros y Sin categoría al final", () => {
    expect(
      order([
        "Otros",
        "Respiratorios",
        "Sin categoría",
        "Factores de Riesgo",
        "Genéticos y Familiares",
      ])
    ).toEqual([
      "Factores de Riesgo",
      "Genéticos y Familiares",
      "Respiratorios",
      "Otros",
      "Sin categoría",
    ]);
  });

  it("no muta el array original", () => {
    const input = ["Renales", "Factores de Riesgo"];
    order(input);
    expect(input).toEqual(["Renales", "Factores de Riesgo"]);
  });

  it("ordena por la categoría extraída de items complejos", () => {
    const items = [
      { category: "Otros", value: 1 },
      { category: "Cardiovasculares", value: 2 },
      { category: "Infectológicos", value: 3 },
    ];
    expect(
      orderAntecedentesCategories(items, (item) => item.category).map(
        (item) => item.value
      )
    ).toEqual([2, 3, 1]);
  });
});
