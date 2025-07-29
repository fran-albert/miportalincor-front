import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { useCompanyMutations } from "@/hooks/Company/useCompanyMutations";
import { StateSelect } from "@/components/Select/State/select";
import { CitySelect } from "@/components/Select/City/select";
import { State } from "@/types/State/State";
import { City } from "@/types/City/City";
import { companySchema } from "@/validators/Company/company.schema";
import { zodResolver } from "@hookform/resolvers/zod";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateCompanyDialog({ isOpen, setIsOpen }: Props) {
  const form = useForm<any>({
    resolver: zodResolver(companySchema),
  });
  const { addCompanyMutations } = useCompanyMutations();
  const { promiseToast } = useToastContext();
  const toggleDialog = () => setIsOpen(!isOpen);
  const { setValue } = form;
  const [selectedState, setSelectedState] = useState<State | undefined>(
    undefined
  );
  const [selectedCity, setSelectedCity] = useState<City | undefined>(undefined);

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    setSelectedCity(undefined);
    setValue("address.city.state", String(state.id));
  };

  const handleCityChange = (city: City) => {
    if (selectedState) {
      const cityWithState = { ...city, state: selectedState };
      setSelectedCity(cityWithState);
      setValue("address.city", cityWithState);
    }
  };

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  async function onSubmit(values: any) {
    const addressData = {
      street: values.address.street,
      number: values.address.number,
      description: values.address.description,
      phoneNumber: values.address.phoneNumber,
      city: {
        id: selectedCity?.id,
        name: selectedCity?.name,
        state: {
          id: selectedState?.id,
          name: selectedState?.name,
          country: {
            id: 1,
            name: "Argentina",
          },
        },
      },
    };
    const payload = {
      ...values,
      addressData
    };
    try {
      const promise = addCompanyMutations.mutateAsync(payload);

      await promiseToast(promise, {
        loading: {
          title: "Creando empresa...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Empresa creada!",
          description: "La empresa se ha creado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al crear empresa",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al crear la empresa", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="max-w-lg rounded-lg p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-gray-800">
            Agregar Nueva Empresa
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Sección: Datos de la Empresa */}
            <div className="grid gap-4">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-black">Nombre</Label>
                    <FormControl>
                      <Input {...field} placeholder="Nombre de la empresa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CUIT */}
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-black">CUIT</Label>
                    <FormControl>
                      <Input {...field} placeholder="30123456789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-black">Email</Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="correo@empresa.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Teléfono */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-black">Teléfono</Label>
                    <FormControl>
                      <Input {...field} placeholder="Número de teléfono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sección: Dirección Detallada */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Dirección</h3>

              {/* Provincia y Ciudad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="address.city.state"
                    render={() => (
                      <FormItem>
                        <Label className="text-black">Provincia</Label>
                        <FormControl>
                          <StateSelect
                            control={form.control}
                            name="address.city.state"
                            onStateChange={handleStateChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="address.city.name"
                    render={() => (
                      <FormItem>
                        <Label className="text-black">Ciudad</Label>
                        <FormControl>
                          <CitySelect
                            control={form.control}
                            idState={
                              selectedState ? Number(selectedState.id) : 0
                            }
                            onCityChange={handleCityChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Calle, Número, Piso y Departamento */}
              <div className="grid grid-cols-4 gap-6">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-black">Calle</Label>
                        <FormControl>
                          <Input {...field} placeholder="Ingresar calle" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="address.number"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-black">N°</Label>
                        <FormControl>
                          <Input {...field} placeholder="Ingresar número" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="address.description"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-black">Piso</Label>
                        <FormControl>
                          <Input {...field} placeholder="Ingresar piso" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="address.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-black">Departamento</Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar departamento"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Botón de Guardar */}
            <Button
              type="submit"
              disabled={addCompanyMutations.isPending}
              className="w-full text-white bg-greenPrimary hover:bg-greenPrimary"
            >
              Guardar Empresa
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
