import React from "react";

interface ExamItem {
  id: string;
  label: string;
  defaultValue?: string;
}

interface PhysicalEvaluationData {
  [key: string]: {
    selected: string;
    observaciones: string;
  };
}

interface PhysicalEvaluationHtmlProps {
  examenFisico: PhysicalEvaluationData;
  section?: number;
}

const section1: ExamItem[] = [
  { id: "piel", label: "Piel y faneras", defaultValue: "" },
  { id: "ojos", label: "Ojos", defaultValue: "" },
  { id: "oidos", label: "Oídos", defaultValue: "" },
  { id: "nariz", label: "Nariz", defaultValue: "" },
  { id: "boca", label: "Boca", defaultValue: "" },
  { id: "faringe", label: "Faringe", defaultValue: "" },
  { id: "cuello", label: "Cuello", defaultValue: "" },
  {
    id: "respiratorio",
    label: "Aparato Respiratorio",
    defaultValue: "",
  },
];

const section2: ExamItem[] = [
  { id: "cardiovascular", label: "Aparato Cardiovascular", defaultValue: "" },
  { id: "digestivo", label: "Aparato Digestivo", defaultValue: "" },
  { id: "genitourinario", label: "Aparato Genitourinario", defaultValue: "" },
  { id: "locomotor", label: "Aparato Locomotor", defaultValue: "" },
  { id: "columna", label: "Columna", defaultValue: "" },
  { id: "miembros-sup", label: "Miembros Superiores", defaultValue: "" },
  { id: "miembros-inf", label: "Miembros Inferiores", defaultValue: "" },
  { id: "varices", label: "Várices", defaultValue: "" },
  { id: "sistema-nervioso", label: "Sistema Nervioso", defaultValue: "" },
  { id: "hernias", label: "Hernias", defaultValue: "" },
];

const PhysicalEvaluationHtml: React.FC<PhysicalEvaluationHtmlProps> = ({
  examenFisico,
  section,
}) => {
  let selectedSections: ExamItem[][] = [];
  if (section === 1) {
    selectedSections = [section1];
  } else if (section === 2) {
    selectedSections = [section2];
  } else {
    selectedSections = [section1, section2];
  }

  return (
    <div className="p-2 mb-2">
      {selectedSections.map((items, index) => (
        <div key={index} className="mb-2">
          {items.map((item) => {
            const current = examenFisico[item.id] || {
              selected: "",
              observaciones: item.defaultValue,
            };

            return (
              <div key={item.id} className="flex flex-row items-start mb-[6px]">
                <p className="w-[120px]  mt-[10px]">{item.label}</p>
                <div className="flex flex-row mr-2">
                  <div className="flex flex-col items-center mr-1">
                    <p className=" mb-[2px]">Sí</p>
                    <div className="w-[20px] h-[20px] border border-black flex justify-center items-center">
                      {current.selected.toLowerCase() === "si" && (
                        <span className="text-[12px] font-bold">X</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center mr-1">
                    <p className="mb-[2px]">No</p>
                    <div className="w-[20px] h-[20px] border border-black flex justify-center items-center">
                      {current.selected.toLowerCase() === "no" && (
                        <span className="text-[12px] font-bold">X</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <p className="mb-[2px]"></p>
                  {current.observaciones ? (
                    <p className="text-[12px]">{current.observaciones || ""}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default PhysicalEvaluationHtml;
