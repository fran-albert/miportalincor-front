"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  isEditing: boolean;
}

export default function GeneralInfoAccordion({ isEditing }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector(
    (state: RootState) => state.preOccupational.formData
  );

  return (
    <AccordionItem value="datos-generales" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Datos Generales
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Campo: Puesto */}
          <div className="space-y-2">
            <Label htmlFor="puesto">Puesto</Label>
            {isEditing ? (
              <Input
                id="puesto"
                value={formData.puesto || ""}
                onChange={(e) =>
                  dispatch(setFormData({ puesto: e.target.value }))
                }
                className="disabled:opacity-50"
              />
            ) : (
              <div className="p-2 border rounded bg-gray-50">
                {formData.puesto || "No definido"}
              </div>
            )}
          </div>

          {/* Campo: Área de trabajo */}
          <div className="space-y-2">
            <Label htmlFor="area">Área de trabajo</Label>
            {isEditing ? (
              <Input
                id="area"
                value={formData.area || ""}
                onChange={(e) =>
                  dispatch(setFormData({ area: e.target.value }))
                }
                className="disabled:opacity-50"
              />
            ) : (
              <div className="p-2 border rounded bg-gray-50">
                {formData.area || "No definido"}
              </div>
            )}
          </div>

          {/* Campo: Antigüedad en el puesto */}
          <div className="space-y-2">
            <Label htmlFor="antiguedad">Antigüedad en el puesto</Label>
            {isEditing ? (
              <Input
                id="antiguedad"
                value={formData.antiguedad || ""}
                onChange={(e) =>
                  dispatch(setFormData({ antiguedad: e.target.value }))
                }
                className="disabled:opacity-50"
              />
            ) : (
              <div className="p-2 border rounded bg-gray-50">
                {formData.antiguedad || "No definido"}
              </div>
            )}
          </div>

          {/* Campo: Tiempo en la empresa */}
          <div className="space-y-2">
            <Label htmlFor="tiempo">Tiempo en la empresa</Label>
            {isEditing ? (
              <Input
                id="tiempo"
                value={formData.tiempo || ""}
                onChange={(e) =>
                  dispatch(setFormData({ tiempo: e.target.value }))
                }
                className="disabled:opacity-50"
              />
            ) : (
              <div className="p-2 border rounded bg-gray-50">
                {formData.tiempo || "No definido"}
              </div>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
