 

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DynamicFormFields from "@/components/DynamicFormField";
import { DataType } from "@/types/Data-Type/Data-Type";
import { DataValue } from "@/types/Data-Value/Data-Value";

interface Props {
  isEditing: boolean;
  dataValues: DataValue[] | undefined;
  fields: DataType[];
}

export default function GeneralInfoAccordion({
  isEditing,
  fields,
  dataValues,
}: Props) {
  const filteredFields = (fields as DataType[]).filter((field) =>
    [
      "Puesto",
      "Área de trabajo",
      "Antigüedad en el puesto",
      "Tiempo en la empresa",
    ].includes(field.name)
  );
  return (
    <AccordionItem value="datos-generales" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Datos Generales
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid gap-4 md:grid-cols-2">
          <DynamicFormFields
            fields={filteredFields}
            isEditing={isEditing}
            dataValues={dataValues}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
