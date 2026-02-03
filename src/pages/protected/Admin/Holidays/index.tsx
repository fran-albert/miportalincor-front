import HolidaysComponent from "@/components/Holidays";
import { Helmet } from "react-helmet-async";

const HolidaysPage = () => {
  return (
    <>
      <Helmet>
        <title>Feriados - Administracion</title>
      </Helmet>
      <HolidaysComponent />
    </>
  );
};

export default HolidaysPage;
