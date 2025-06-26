import { Label } from "@/components/ui/label";

interface InfoFieldProps {
  label: string;
  value?: string;
}

export function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="flex-1 px-2">
      <Label className="mb-1">{label}</Label>
      <p>{value ?? "—"}</p>
    </div>
  );
}
