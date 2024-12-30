import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BloodTestData } from "@/types/Blod-Test-Data/Blod-Test-Data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface LabsChartProps {
  testName: string;
  testData: BloodTestData[];
}

export default function LabsChart({ testName, testData }: LabsChartProps) {
  // Ordenar por fecha descendente y obtener las dos últimas fechas
  const recentData = testData
    .sort(
      (a, b) =>
        new Date(b.study.date || "").getTime() -
        new Date(a.study.date || "").getTime()
    )
    .slice(0, 2)
    .map((data) => ({
      date: data.study.date || "Sin Fecha",
      value: parseFloat(data.value) || 0,
      unit: data.bloodTest.unit?.name || "Sin Unidad",
      reference: data.bloodTest.referenceValue || "Sin Rango",
    }));

  const period =
    recentData.length === 2
      ? `${recentData[1].date} - ${recentData[0].date}`
      : "Periodo no disponible";

  const unit = recentData[0]?.unit || "Sin Unidad";
  const reference = recentData[0]?.reference || "Sin Rango";

  // Parsear rango de referencia
  const parseReferenceRange = (reference: string) => {
    const rangeMatch = reference.match(/(\d+(\.\d+)?)\s*-\s*(\d+(\.\d+)?)/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[3]);
      return { min, max };
    }
    return { min: 0, max: 160 };
  };

  const { min, max } = parseReferenceRange(reference);
  const adjustedMax = max + (max - min) * 0.1;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center text-greenPrimary">
          {testName}
        </CardTitle>
        <div className="text-sm text-muted-foreground space-y-1 mt-2">
          <p>
            Unidad: <span className="font-semibold">{unit}</span>
          </p>
          <p>
            Rango de referencia:{" "}
            <span className="font-semibold">{reference}</span>
          </p>
          <p>
            Periodo: <span className="font-semibold">{period}</span>
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {recentData.length >= 2 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={recentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString("es-ES")
                }
              />
              <YAxis domain={[min, adjustedMax]} />
              <ReferenceLine
                y={min}
                label={{
                  value: `Mín: ${min}`,
                  position: "left",
                  fill: "green",
                  fontSize: 12,
                }}
                stroke="green"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={max}
                label={{
                  value: `Máx: ${max}`,
                  position: "left",
                  fill: "red",
                  fontSize: 12,
                }}
                stroke="red"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
                dot
                label={({ x, y, value }) => (
                  <text
                    x={x}
                    y={y - 10} // Ajustar la posición vertical del texto
                    textAnchor="middle"
                    fontSize={12}
                    className="font-bold"
                    fill="#000000"
                  >
                    {value}
                  </text>
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">
            No hay suficientes datos para comparar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
