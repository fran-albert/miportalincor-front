import { formatDate } from "@/common/helpers/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { columNames, Lab, referenceValues, units } from "@/types/Lab/Lab";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface LabsChartProps {
  labKey: keyof Lab;
  labData: Lab[];
}

export default function LabsChart({ labKey, labData }: LabsChartProps) {
  const chartData = labData
    .map((lab) => ({
      date: lab.date || "Fecha no disponible",
      value: parseFloat(String(lab[labKey])) || 0,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const title = columNames[labKey] || labKey;
  const unit = units[labKey] || "";
  const reference = referenceValues[labKey] || "";

  const parseReferenceRange = (reference: string) => {
    const rangeMatch = reference.match(/(\d+(\.\d+)?)\s*-\s*(\d+(\.\d+)?)/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[3]);
      return { min, max };
    }
    return { min: 0, max: 160 };
  };

  const { min, max } = parseReferenceRange(reference as string);

  const adjustedMax = max + (max - min) * 0.1;

  const latestValue = chartData[chartData.length - 1]?.value || "N/A";

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center text-greenPrimary">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Unidad: {unit}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Valor Hallado:</span>
            <span className="font-semibold">
              {latestValue} {unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Valores de referencia:</span>
            <span>{reference}</span>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                type="category"
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis domain={[min, adjustedMax]} tick={{ fontSize: 12 }} />
              <TooltipProvider>
                {chartData.map((entry, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger>
                      <circle
                        cx={entry.date}
                        cy={entry.value}
                        r={6}
                        fill="#0000FF"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fecha: {entry.date}</p>
                      <p>
                        Valor: {entry.value} {unit}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>

              {/* Línea azul para los valores hallados */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0000FF"
                strokeWidth={2}
                dot={{ r: 6 }}
                label={({ x, y, value }) => (
                  <text
                    x={x}
                    y={y - 10} // Ajusta la posición vertical del texto
                    textAnchor="middle"
                    fontSize={12}
                    fill="#0000FF"
                  >
                    {value} {unit}
                  </text>
                )}
              />

              {/* Líneas de referencia si se encuentran rangos válidos */}
              {min !== 0 && max !== 160 && (
                <>
                  <ReferenceLine
                    y={min}
                    label={{
                      position: "left",
                      style: {
                        fontSize: 14,
                        fill: "green",
                        backgroundColor: "white",
                        padding: "4px",
                        fontWeight: "bold",
                      },
                    }}
                    stroke="green"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                  />
                  <ReferenceLine
                    y={max}
                    label={{
                      position: "left",
                      style: {
                        fontSize: 14,
                        fill: "red",
                        backgroundColor: "white",
                        padding: "4px",
                        fontWeight: "bold",
                      },
                    }}
                    stroke="red"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border rounded-lg p-4">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-greenPrimary">Periodo</th>
                <th className="text-right text-greenPrimary">mg/dL</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item) => (
                <tr key={item.date}>
                  <td className="text-left">{formatDate(item.date)}</td>
                  <td className="text-right">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
