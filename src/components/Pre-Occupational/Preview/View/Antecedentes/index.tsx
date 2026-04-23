import { DataValue } from "@/types/Data-Value/Data-Value";
import React from "react";

interface AntecedentesListProps {
  dataValues: DataValue[];
}

const AntecedentesList: React.FC<AntecedentesListProps> = ({ dataValues }) => {
  const antecedentes = dataValues.filter(
    (item) => item.dataType.category === "ANTECEDENTES"
  );

  return (
    <div className="antecedentes">
      <h2 className="font-bold mb-2">Antecedentes Personales</h2>
      {antecedentes.length > 0 ? (
        <ul className="list-disc pl-5">
          {antecedentes.map(({ id, value }) => (
            <li key={id}>{value}</li>
          ))}
        </ul>
      ) : (
        <p>No se encontraron antecedentes.</p>
      )}
    </div>
  );
};

export default AntecedentesList;
