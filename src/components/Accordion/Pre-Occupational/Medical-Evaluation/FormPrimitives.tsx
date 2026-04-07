import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ClinicalBlockProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ClinicalBlock({
  title,
  description,
  children,
  className,
}: ClinicalBlockProps) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-greenPrimary">{title}</h4>
        {description ? (
          <p className="text-xs leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

interface BooleanChoiceFieldProps {
  label: string;
  value?: boolean;
  disabled?: boolean;
  positiveLabel?: string;
  negativeLabel?: string;
  onChange: (value: boolean | undefined) => void;
  idPrefix: string;
}

export function BooleanChoiceField({
  label,
  value,
  disabled,
  positiveLabel = "Si",
  negativeLabel = "No",
  onChange,
  idPrefix,
}: BooleanChoiceFieldProps) {
  const radioValue = value === true ? "si" : value === false ? "no" : "";
  const options = [
    { value: "si", label: positiveLabel },
    { value: "no", label: negativeLabel },
  ] as const;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <RadioGroup
        value={radioValue}
        disabled={disabled}
        onValueChange={(nextValue) =>
          onChange(
            nextValue === "si" ? true : nextValue === "no" ? false : undefined
          )
        }
        className="grid gap-3 sm:grid-cols-2"
      >
        {options.map((option) => {
          const isSelected = radioValue === option.value;
          const optionId = `${idPrefix}-${option.value}`;

          return (
            <Label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors",
                disabled && "cursor-not-allowed opacity-60",
                isSelected
                  ? "border-greenPrimary bg-greenPrimary/8 text-greenSecondary shadow-sm"
                  : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-greenPrimary/30 hover:bg-white"
              )}
            >
              <RadioGroupItem
                value={option.value}
                id={optionId}
                className={cn(
                  "h-5 w-5 border-2",
                  isSelected
                    ? "border-greenPrimary text-greenPrimary"
                    : "border-slate-400 text-slate-500"
                )}
              />
              <span className="font-medium">{option.label}</span>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}

interface NotesFieldProps {
  id: string;
  label: string;
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
}

export function NotesField({
  id,
  label,
  value,
  disabled,
  placeholder,
  rows = 3,
  onChange,
}: NotesFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <Textarea
        id={id}
        rows={rows}
        value={value ?? ""}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="resize-none bg-white text-slate-900"
      />
    </div>
  );
}
