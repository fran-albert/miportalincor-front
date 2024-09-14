import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudyTypeSelectProps {
  studyTypes: string[];
  selectedStudyType: string | null;
  onStudyTypeChange: (value: string) => void;
}

export const StudyTypeSelect = ({
  studyTypes,
  selectedStudyType,
  onStudyTypeChange,
}: StudyTypeSelectProps) => {
  return (
    <Select onValueChange={onStudyTypeChange} value={selectedStudyType || ""}>
      <SelectTrigger className="w-full mx-auto">
        <SelectValue placeholder="Seleccione tipo de estudio" />
      </SelectTrigger>
      <SelectContent>
        {studyTypes.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
