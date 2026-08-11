import { cn } from "@/lib/utils";

interface PainScaleInputProps {
  value: number | null;
  onChange: (value: number) => void;
  min: number;
  max: number;
  disabled?: boolean;
}

/**
 * Escala 1-10 como botones y no como `<input type="number">`: el campo que en
 * la ficha de papel quedó VACÍO tiene que ser el más fácil de completar de
 * todo el formulario. Un clic, sin teclado.
 */
export default function PainScaleInput({
  value,
  onChange,
  min,
  max,
  disabled,
}: PainScaleInputProps) {
  const options = Array.from(
    { length: max - min + 1 },
    (_, index) => min + index
  );

  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Nivel de dolor">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "h-9 w-9 rounded-md border text-sm font-semibold transition-colors",
            value === option
              ? "border-greenPrimary bg-greenPrimary text-white"
              : "border-gray-300 bg-white text-gray-700 hover:border-greenPrimary",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
