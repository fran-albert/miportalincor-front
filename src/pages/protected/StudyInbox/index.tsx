import { Helmet } from "react-helmet-async";
import { StudyInboxScreen } from "@/components/StudyInbox/Table/table";

const StudyInboxPage = () => {
  return (
    <>
      <Helmet>
        <title>Estudios recibidos</title>
      </Helmet>
      <StudyInboxScreen />
    </>
  );
};

export default StudyInboxPage;
