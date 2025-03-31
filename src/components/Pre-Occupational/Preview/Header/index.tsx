import React from "react";

interface HeaderPreviewHtmlProps {
  evaluationType: string;
  examType: string;
}

const HeaderPreviewHtml: React.FC<HeaderPreviewHtmlProps> = ({
  evaluationType,
  examType,
}) => {
  return (
    <div>
      <div className="border border-black p-1 mb-2">
        <div className="flex flex-row items-center justify-between h-[70px]">
          <div className="flex-1 flex items-center justify-center">
            <img
              className="h-16"
              src="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743117056/dpwo5yinodpy9ibpjtum.png"
              alt="Logo"
            />
          </div>

          <div className="w-[1px] bg-gray-800 h-full" />

          <div className="flex-1 pr-[10px] flex flex-col items-center justify-center">
            <span className="font-bold">{examType}</span>
            <span>{evaluationType}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderPreviewHtml;
