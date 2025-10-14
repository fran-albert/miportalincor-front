import ShifComponent from "@/components/Shift/Component";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { useSpeciality } from "@/hooks/Speciality/useSpeciality";

const ShiftsPage = () => {
  const { specialities } = useSpeciality({ auth: true });
  const { doctors } = useDoctors({ auth: true, fetchDoctors: true });

  return <ShifComponent specialities={specialities} doctors={doctors} />;
};

export default ShiftsPage;
