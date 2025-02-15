"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  isEditing: boolean;
}

export default function InstitutionInformation({ isEditing }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const institutionInfo = useSelector(
    (state: RootState) => state.preOccupational.formData.institutionInformation
  );

  const handleInputChange = (field: string, value: string) => {
    dispatch(
      setFormData({
        institutionInformation: {
          ...institutionInfo,
          [field]: value,
        },
      })
    );
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Institución */}
        <div className="space-y-2">
          <Label htmlFor="institucion">Institución</Label>
          {isEditing ? (
            <Input
              id="institucion"
              value={institutionInfo.institucion || ""}
              onChange={(e) => handleInputChange("institucion", e.target.value)}
            />
          ) : (
            <div className="p-2 border rounded bg-gray-50">
              {institutionInfo.institucion || "No definido"}
            </div>
          )}
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <Label htmlFor="direccion">Dirección</Label>
          {isEditing ? (
            <Input
              id="direccion"
              value={institutionInfo.direccion || ""}
              onChange={(e) => handleInputChange("direccion", e.target.value)}
            />
          ) : (
            <div className="p-2 border rounded bg-gray-50">
              {institutionInfo.direccion || "No definido"}
            </div>
          )}
        </div>

        {/* Provincia */}
        <div className="space-y-2">
          <Label htmlFor="provincia">Provincia</Label>
          {isEditing ? (
            <Select
              value={institutionInfo.provincia || ""}
              onValueChange={(value) => handleInputChange("provincia", value)}
            >
              <SelectTrigger id="provincia">
                <SelectValue placeholder="Seleccione provincia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buenos-aires">Buenos Aires</SelectItem>
                {/* Agrega otras provincias según sea necesario */}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-2 border rounded bg-gray-50">
              {institutionInfo.provincia || "No definido"}
            </div>
          )}
        </div>

        {/* Ciudad */}
        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad</Label>
          {isEditing ? (
            <Select
              value={institutionInfo.ciudad || ""}
              onValueChange={(value) => handleInputChange("ciudad", value)}
            >
              <SelectTrigger id="ciudad">
                <SelectValue placeholder="Seleccione ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mdp">MAR DEL PLATA</SelectItem>
                {/* Agrega otras ciudades según sea necesario */}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-2 border rounded bg-gray-50">
              {institutionInfo.ciudad || "No definido"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
