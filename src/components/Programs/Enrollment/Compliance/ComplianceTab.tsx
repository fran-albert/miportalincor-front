import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompliance } from "@/hooks/Program/useCompliance";
import { format, subDays } from "date-fns";

interface ComplianceTabProps {
  enrollmentId: string;
}

const RANGE_PRESETS = [
  { key: "30", label: "Último mes", days: 30 },
  { key: "90", label: "Últimos 3 meses", days: 90 },
  { key: "365", label: "Último año", days: 365 },
] as const;

export default function ComplianceTab({ enrollmentId }: ComplianceTabProps) {
  const today = new Date();
  const [preset, setPreset] = useState<string | null>("30");
  const [from, setFrom] = useState(
    format(subDays(today, 30), "yyyy-MM-dd")
  );
  const [to, setTo] = useState(format(today, "yyyy-MM-dd"));
  const { compliance, isLoading } = useCompliance(enrollmentId, from, to);

  const applyPreset = (key: string, days: number) => {
    const now = new Date();
    setPreset(key);
    setFrom(format(subDays(now, days), "yyyy-MM-dd"));
    setTo(format(now, "yyyy-MM-dd"));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex gap-2">
          {RANGE_PRESETS.map((range) => (
            <Button
              key={range.key}
              type="button"
              size="sm"
              variant={preset === range.key ? "default" : "outline"}
              onClick={() => applyPreset(range.key, range.days)}
            >
              {range.label}
            </Button>
          ))}
        </div>
        <div className="flex items-end gap-4">
          <div className="space-y-1">
            <Label className="text-sm">Desde</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => {
                setPreset(null);
                setFrom(e.target.value);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Hasta</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => {
                setPreset(null);
                setTo(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Calculando cumplimiento...</div>
      ) : compliance ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Cumplimiento Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 w-full rounded-full bg-gray-200">
                    <div
                      className="h-4 rounded-full bg-greenPrimary transition-all"
                      style={{
                        width: `${Math.min(compliance.globalCompliance, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold text-greenPrimary">
                  {Math.round(compliance.globalCompliance)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {compliance.activities.map((ac) => (
            <Card key={ac.activityId}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{ac.activityName}</span>
                  <span className="text-sm text-gray-500">
                    {ac.attended}/{ac.expected} asistencias
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-3 w-full rounded-full bg-gray-200">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min(ac.compliance, 100)}%`,
                          backgroundColor:
                            ac.compliance >= 80
                              ? "#22c55e"
                              : ac.compliance >= 50
                                ? "#eab308"
                                : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {Math.round(ac.compliance)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay datos de cumplimiento para el período seleccionado.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
