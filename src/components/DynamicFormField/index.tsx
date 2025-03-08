import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { useEffect } from "react";

interface Field {
  id: number;
  name: string;
  dataType: "STRING" | "NUMBER" | "BOOLEAN" | "DATE";
}

interface DynamicFormFieldsProps {
  fields: Field[];
  isEditing: boolean;
  dataValues?: DataValue[];
}

export default function DynamicFormFields({
  fields,
  isEditing,
  dataValues,
}: DynamicFormFieldsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(
    (state: RootState) => state.preOccupational.formData
  );

  useEffect(() => {
    if (dataValues) {
      const initialData = dataValues
        .filter((dv) => fields.some((f) => f.name === dv.dataType.name))
        .reduce((acc, dv) => {
          if (!(dv.dataType.name in formData)) {
            acc[dv.dataType.name] =
              dv.dataType.dataType === "NUMBER" ? Number(dv.value) : dv.value;
          }
          return acc;
        }, {} as Record<string, any>);

      if (Object.keys(initialData).length > 0) {
        dispatch(setFormData(initialData));
      }
    }
  }, [dataValues, dispatch, fields, formData]);

  const getFieldValue = (fieldName: string) => {
    if (fieldName in formData) {
      return (formData as any)[fieldName];
    }
    const dataValue = dataValues?.find((dv) => dv.dataType.name === fieldName);
    return dataValue ? dataValue.value : "";
  };

  const handleChange = (fieldName: string, value: string | number | boolean) => {
    dispatch(setFormData({ [fieldName]: value }));
  };

  return (
    <>
      {fields.map((field) => {
        const fieldValue = getFieldValue(field.name) ?? ""; 

        switch (field.dataType) {
          case "STRING":
            return (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.name}>{field.name}</Label>
                {isEditing ? (
                  <Input
                    id={field.name}
                    value={fieldValue}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="disabled:opacity-50"
                  />
                ) : (
                  <div className="p-2 border rounded bg-gray-50">
                    {fieldValue || "No definido"}
                  </div>
                )}
              </div>
            );
          case "NUMBER":
            return (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.name}>{field.name}</Label>
                {isEditing ? (
                  <Input
                    id={field.name}
                    type="number"
                    value={fieldValue}
                    onChange={(e) => handleChange(field.name, Number(e.target.value))}
                    className="disabled:opacity-50"
                  />
                ) : (
                  <div className="p-2 border rounded bg-gray-50">
                    {fieldValue !== undefined && fieldValue !== ""
                      ? fieldValue
                      : "No definido"}
                  </div>
                )}
              </div>
            );
          case "BOOLEAN":
            return (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.name}>{field.name}</Label>
                {isEditing ? (
                  <input
                    id={field.name}
                    type="checkbox"
                    checked={!!fieldValue}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                  />
                ) : (
                  <div className="p-2 border rounded bg-gray-50">
                    {fieldValue !== undefined
                      ? fieldValue
                        ? "Sí"
                        : "No"
                      : "No definido"}
                  </div>
                )}
              </div>
            );
          default:
            return null;
        }
      })}
    </>
  );
}