import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import WaistEvolutionCard from "./index";

vi.mock("../Chart", () => ({
  NutritionChart: ({ data }: { data: NutritionData[] }) => (
    <div data-testid="nutrition-chart">{data.length} puntos</div>
  ),
}));

const record = (date: string, waist?: number): NutritionData => ({
  id: date,
  userId: "1515",
  date,
  weight: 100,
  difference: 0,
  fatPercentage: 0,
  musclePercentage: 0,
  visceralFat: 0,
  imc: 0,
  height: 153,
  targetWeight: 0,
  observations: "",
  waist,
});

const data = [
  record("2026-02-20T00:00:00.000Z", 112),
  record("2026-03-20T00:00:00.000Z"),
  record("2026-05-20T00:00:00.000Z", 105.5),
  record("2026-09-23T00:00:00.000Z", 98),
];

describe("WaistEvolutionCard", () => {
  it("grafica solo los registros con cintura y muestra cuánto bajó", () => {
    render(<WaistEvolutionCard nutritionData={data} />);

    expect(screen.getByTestId("nutrition-chart")).toHaveTextContent("3 puntos");
    const box = screen.getByLabelText("Cambio de cintura");
    expect(box).toHaveTextContent("Bajó");
    expect(box).toHaveTextContent("−14,0 cm");
    expect(box).toHaveTextContent("112,0 → 98,0 cm");
    expect(box).toHaveTextContent("20-02-2026 al 23-09-2026");
  });

  it("respeta el rango de fechas del filtro", () => {
    render(
      <WaistEvolutionCard nutritionData={data} startDate={new Date(2026, 4, 1)} />
    );

    expect(screen.getByTestId("nutrition-chart")).toHaveTextContent("2 puntos");
    expect(screen.getByLabelText("Cambio de cintura")).toHaveTextContent(
      "−7,5 cm"
    );
  });

  it("sin medidas de cintura muestra el estado vacío", () => {
    render(<WaistEvolutionCard nutritionData={[record("2026-02-20T00:00:00.000Z")]} />);

    expect(
      screen.getByText("No hay medidas de cintura en este rango de fechas")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("nutrition-chart")).not.toBeInTheDocument();
  });
});
