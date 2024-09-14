import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudyYearSelectProps {
  years: string[];
  selectedYear: string | null;
  onYearChange: (value: string) => void;
}

export const StudyYearSelect = ({
  years,
  selectedYear,
  onYearChange,
}: StudyYearSelectProps) => {
  return (
    <Select onValueChange={onYearChange} value={selectedYear || ""}>
      <SelectTrigger className="w-full mx-auto">
        <SelectValue placeholder="Seleccione año" />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
