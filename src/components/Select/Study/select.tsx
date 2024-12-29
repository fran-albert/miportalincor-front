import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudyType } from "@/hooks/Study-Type/useStudyType";
import { StudyType } from "@/types/Study-Type/Study-Type";

interface StudySelectProps {
  selected?: StudyType;
  onStudyChange?: (value: StudyType) => void;
}

export const StudyTypeSelect = ({
  selected,
  onStudyChange,
}: StudySelectProps) => {
  const { StudyType } = useStudyType({
    studyTypeAuth: true,
  });

  const handleValueChange = (selectedId: string) => {
    const selectedState = StudyType?.find(
      (studyType) => String(studyType.id) === selectedId
    );
    if (onStudyChange && selectedState) {
      onStudyChange(selectedState);
    }
  };

  return (
    <Select value={selected?.id?.toString()} onValueChange={handleValueChange}>
      <SelectTrigger className="text-black">
        <SelectValue placeholder="Seleccione tipo de estudio..." />
      </SelectTrigger>
      <SelectContent>
        {StudyType?.map((studyType) => (
          <SelectItem key={studyType.id} value={String(studyType.id)}>
            {studyType.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
