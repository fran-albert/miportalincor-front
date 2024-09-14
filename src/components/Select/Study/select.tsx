import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Study } from "@/types/Study/Study";
import { useStudy } from "@/hooks/Study/useStudy";

interface StudySelectProps {
  selected?: Study;
  onStudyChange?: (value: Study) => void;
}

export const StudyTypeSelect = ({
  selected,
  onStudyChange,
}: StudySelectProps) => {
  const { studyType } = useStudy({ studyTypeAuth: true });

  const handleValueChange = (selectedId: string) => {
    const selectedState = studyType?.find(
      (state) => String(state.id) === selectedId
    );
    if (onStudyChange && selectedState) {
      onStudyChange(selectedState);
    }
  };

  return (
    <Select value={selected?.id.toString()} onValueChange={handleValueChange}>
      <SelectTrigger className=" text-black">
        <SelectValue placeholder="Seleccione tipo de estudio..." />
      </SelectTrigger>
      <SelectContent>
        {studyType?.map((studie) => (
          <SelectItem key={String(studie.id)} value={String(studie.id)}>
            {studie.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
