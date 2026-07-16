import { useId } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEcoSubtypes } from "@/hooks/ConsultationType";

interface EcoTypeNoteFieldProps {
  /** Nota que se va a mandar en el confirm; vacía = decide el backend. */
  value: string;
  onChange: (value: string) => void;
  /** Subtipo detectado en la ingesta, para el hint de valor automático. */
  detectedSubtype: string | null;
}

const SEPARATOR = ", ";

/**
 * Tipo/nota del estudio de eco al confirmar: chips del catálogo (toggle,
 * componen la nota separada por coma — un turno puede tener 2 ecos) + campo
 * de texto libre. Vacío = no se manda nota y el backend usa el tipo del
 * turno (leído al confirmar) o el subtipo detectado.
 */
export const EcoTypeNoteField = ({
  value,
  onChange,
  detectedSubtype,
}: EcoTypeNoteFieldProps) => {
  const inputId = useId();
  const { ecoSubtypes, isLoading } = useEcoSubtypes();

  const parts = value
    .split(SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean);

  const toggleSubtype = (name: string) => {
    const next = parts.includes(name)
      ? parts.filter((part) => part !== name)
      : [...parts, name];
    onChange(next.join(SEPARATOR));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>Tipo de ecografía / nota</Label>
      {!isLoading && ecoSubtypes.length > 0 && (
        <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
          {ecoSubtypes.map((subtype) => {
            const selected = parts.includes(subtype.name);
            return (
              <button
                key={subtype.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleSubtype(subtype.name)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition",
                  selected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                )}
              >
                {selected && <Check className="h-3 w-3 text-emerald-600" />}
                {subtype.name}
              </button>
            );
          })}
        </div>
      )}
      <Input
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Elegí del catálogo o escribí la nota"
      />
      {value.trim().length === 0 && (
        <p className="text-xs text-gray-500">
          Vacío: se usa el tipo del turno
          {detectedSubtype ? ` (detectado: ${detectedSubtype})` : ""}.
        </p>
      )}
    </div>
  );
};
