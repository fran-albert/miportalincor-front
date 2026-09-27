import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompliance } from "@/hooks/Program/useCompliance";
import {
  COMPLIANCE_RANGE_PRESETS,
  ComplianceRangeKey,
  DEFAULT_COMPLIANCE_RANGE,
  formatCompliancePercent,
  getComplianceRange,
  getExtraSessions,
} from "@/common/helpers/compliance-range.helpers";

interface ComplianceTabProps {
  enrollmentId: string;
}

export default function ComplianceTab({ enrollmentId }: ComplianceTabProps) {
  const [preset, setPreset] = useState<ComplianceRangeKey | null>(
    DEFAULT_COMPLIANCE_RANGE
  );
  const [from, setFrom] = useState(
    () => getComplianceRange(DEFAULT_COMPLIANCE_RANGE).from
  );
  const [to, setTo] = useState(
    () => getComplianceRange(DEFAULT_COMPLIANCE_RANGE).to
  );
  const { compliance, isLoading } = useCompliance(enrollmentId, from, to);

  const applyPreset = (key: ComplianceRangeKey) => {
    const range = getComplianceRange(key);
    setPreset(key);
    setFrom(range.from);
    setTo(range.to);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex gap-2">
          {COMPLIANCE_RANGE_PRESETS.map((range) => (
            <Button
              key={range.key}
              type="button"
              size="sm"
              variant={preset === range.key ? "default" : "outline"}
              onClick={() => applyPreset(range.key)}
            >
              {range.label}
            </Button>
          ))}
        </div>
        <div className="flex items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="compliance-from" className="text-sm">
              Desde
            </Label>
            <Input
              id="compliance-from"
              type="date"
              value={from}
              onChange={(e) => {
                setPreset(null);
                setFrom(e.target.value);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="compliance-to" className="text-sm">
              Hasta
            </Label>
            <Input
              id="compliance-to"
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
          {compliance.recordsWithoutActivePlan ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-amber-900">
                {compliance.recordsWithoutActivePlan}{" "}
                {compliance.recordsWithoutActivePlan === 1
                  ? "asistencia registrada sin plan vigente"
                  : "asistencias registradas sin plan vigente"}
              </p>
              <p className="text-sm text-amber-800">
                Sin plan vigente no hay sesiones esperadas contra las cuales
                medir: cargá el plan del paciente en la pestaña Plan para que el
                cumplimiento tenga sentido.
              </p>
            </div>
          ) : null}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Cumplimiento Global</CardTitle>
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
                  {formatCompliancePercent(compliance.globalCompliance)}
                </span>
              </div>
            </CardContent>
          </Card>

          {compliance.activities.map((ac) => {
            const extraSessions = getExtraSessions(ac);
            return (
              <Card
                key={ac.activityId}
                data-testid={`compliance-activity-${ac.activityId}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {ac.activityName}
                      {ac.recordsWithoutActivePlan ? (
                        <span className="ml-2 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                          {ac.recordsWithoutActivePlan} sin plan vigente
                        </span>
                      ) : null}
                    </span>
                    <span className="text-sm text-gray-500">
                      {ac.expected === 0
                        ? `${ac.attended} asistencias, sin sesiones esperadas`
                        : `${ac.attended}/${ac.expected} asistencias`}
                      {extraSessions > 0 ? (
                        <span className="ml-2 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800">
                          {extraSessions} más de lo previsto
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-3 w-full rounded-full bg-gray-200">
                        <div
                          data-compliance-bar
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
                      {formatCompliancePercent(ac.compliance)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
