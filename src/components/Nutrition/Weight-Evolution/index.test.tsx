import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import WeightEvolutionCard from "./index";

vi.mock("../Chart", () => ({
  NutritionChart: () => <div data-testid="nutrition-chart" />,
}));

const record = (date: string, weight: number, targetWeight = 0): NutritionData => ({
  id: date,
  userId: "1515",
  date,
  weight,
  difference: 0,
  fatPercentage: 0,
  musclePercentage: 0,
  visceralFat: 0,
  imc: 0,
  height: 153,
  targetWeight,
  observations: "",
});

const data = [
  record("2026-02-20T00:00:00.000Z", 114.6, 102),
  record("2026-05-20T00:00:00.000Z", 101.9, 101),
  record("2026-09-23T00:00:00.000Z", 95.4, 89.9),
];

const renderCard = (
  nutritionData: NutritionData[],
  startDate?: Date,
  endDate?: Date
) =>
  render(
    <WeightEvolutionCard
      nutritionData={nutritionData}
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={() => {}}
      onEndDateChange={() => {}}
    />
  );

describe("WeightEvolutionCard - kilos descendidos", () => {
  it("🔴 muestra cuánto bajó en el período, de dónde a dónde y cuánto falta", () => {
    renderCard(data);

    const box = screen.getByLabelText("Kilos descendidos");
    expect(box).toHaveTextContent("Bajó");
    expect(box).toHaveTextContent("−19,2 kg");
    expect(box).toHaveTextContent("114,6 → 95,4 kg");
    expect(box).toHaveTextContent("20-02-2026 al 23-09-2026");
    expect(box).toHaveTextContent("Faltan 5,5 kg para el peso objetivo");
  });

  it("respeta el filtro Desde/Hasta", () => {
    renderCard(data, new Date(2026, 4, 1), undefined);

    const box = screen.getByLabelText("Kilos descendidos");
    expect(box).toHaveTextContent("−6,5 kg");
    expect(box).toHaveTextContent("20-05-2026 al 23-09-2026");
  });

  it("un aumento se lee como aumento, no en verde", () => {
    renderCard([record("2026-08-01", 80), record("2026-09-01", 81.3)]);

    const box = screen.getByLabelText("Kilos descendidos");
    expect(box).toHaveTextContent("Subió");
    expect(box).toHaveTextContent("+1,3 kg");
    expect(box.className).not.toMatch(/green/);
  });

  it("con un solo registro en el rango no aparece", () => {
    renderCard([record("2026-09-01", 80)]);

    expect(screen.queryByLabelText("Kilos descendidos")).not.toBeInTheDocument();
  });
});
