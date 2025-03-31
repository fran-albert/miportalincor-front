import React from "react";
import HeaderPreviewHtml from "../../Header";
import FooterHtml from "../Footer";

interface StudyPageHtmlProps {
  studyTitle: string;
  studyUrl: string;
  pageNumber: number;
}

const StudyPageHtml: React.FC<StudyPageHtmlProps> = ({
  studyTitle,
  studyUrl,
  pageNumber,
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Aquí se coloca el header */}
      <HeaderPreviewHtml
        evaluationType={"Preocupacional"}
        examType={`Complementarios - ${studyTitle}`}
      />

      {/* Contenido principal */}
      <div className="p-[20px] font-sans flex flex-col flex-grow">
        <div className="flex-grow flex justify-center items-center">
          <img
            src={studyUrl}
            alt={studyTitle}
            className="w-full max-h-[800px] object-contain"
          />
        </div>
      </div>
      {/* Aquí se coloca el footer */}
      <FooterHtml
        pageNumber={pageNumber}
        doctorName="Dr. Juan Pérez"
        doctorLicense="12345"
        signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1740699262/wrivrtuyqs3yqo299ooo.png"
      />
    </div>
  );
};

export default StudyPageHtml;
