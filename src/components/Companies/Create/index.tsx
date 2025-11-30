import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
import { z } from "zod";
import { ApiError } from "@/types/Error/ApiError";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Plus
} from "lucide-react";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateCompanyDialog({ isOpen, setIsOpen }: Props) {
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
  });
  const { addCompanyMutations } = useCompanyMutations();
  const { promiseToast } = useToastContext();
  const { setValue, watch } = form;

  const [selectedState, setSelectedState] = useState<State | undefined>(
    undefined
  );
  const [selectedCity, setSelectedCity] = useState<City | undefined>(undefined);

  const nameValue = watch("name");

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    setSelectedCity(undefined);
    // Don't reset address.city.state here as it causes the select to reset
    // The StateSelect component already handles updating this value
  };

  const handleCityChange = (city: City) => {
    if (selectedState) {
      const cityWithState = { ...city, state: selectedState };
      setSelectedCity(cityWithState);
      setValue("address.city", cityWithState);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedState(undefined);
    setSelectedCity(undefined);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      form.reset();
      setSelectedState(undefined);
      setSelectedCity(undefined);
    }
  }, [isOpen, form]);

  async function onSubmit(values: z.infer<typeof companySchema>) {
    const addressData = {
      street: values.address.street || "",
      number: values.address.number || "",
      description: values.address.description || "",
      phoneNumber: values.address.phoneNumber || "",
      city: {
        id: selectedCity?.id || 0,
        name: selectedCity?.name || "",
        state: {
          id: selectedState?.id || 0,
          name: selectedState?.name || "",
          country: {
            id: 1,
            name: "Argentina",
          },
        },
      },
    };
    const payload = {
      name: values.name,
      taxId: values.taxId,
      email: values.email,
      phone: values.phone,
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
        error: (error: ApiError) => ({
          title: "Error al crear empresa",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      handleClose();
    } catch (error) {
      console.error("Error al crear la empresa", error);
    }
  }

  const currentDate = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden p-0">
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-greenPrimary to-teal-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Agregar Nueva Empresa</h2>
              <p className="text-sm text-white/80 mt-1">
                Complete la información de la empresa y su dirección
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Info Card - Fecha */}
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">
                  Fecha de Registro
                </p>
                <p className="text-xs text-blue-700 mt-1 capitalize">
                  {currentDate}
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Datos de la Empresa - Blue */}
              <div className="border-l-4 border-l-blue-500 bg-blue-50/50 rounded-lg p-4 space-y-4">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Información de la Empresa
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-greenPrimary" />
                            Nombre *
                          </Label>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nombre de la empresa"
                              className="focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
                              maxLength={100}
                            />
                          </FormControl>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <p className="text-gray-500">
                              Razón social o nombre comercial
                            </p>
                            <span className="text-gray-400">
                              {nameValue?.length || 0} / 100
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* CUIT */}
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-greenPrimary" />
                          CUIT *
                        </Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="30123456789"
                            className="focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
                          />
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
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-greenPrimary" />
                          Email *
                        </Label>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="correo@empresa.com"
                            className="focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
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
                      <FormItem className="md:col-span-2">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-greenPrimary" />
                          Teléfono *
                        </Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Número de teléfono"
                            className="focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Dirección - Purple */}
              <div className="border-l-4 border-l-purple-500 bg-purple-50/50 rounded-lg p-4 space-y-4">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  Dirección
                </Label>

                {/* Provincia y Ciudad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.city.state"
                    render={() => (
                      <FormItem>
                        <Label className="text-sm font-semibold text-gray-700">
                          Provincia *
                        </Label>
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

                  <FormField
                    control={form.control}
                    name="address.city.name"
                    render={() => (
                      <FormItem>
                        <Label className="text-sm font-semibold text-gray-700">
                          Ciudad *
                        </Label>
                        <FormControl>
                          <CitySelect
                            control={form.control}
                            idState={selectedState ? Number(selectedState.id) : 0}
                            onCityChange={handleCityChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Calle y Número */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-sm font-semibold text-gray-700">
                            Calle
                          </Label>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nombre de la calle"
                              className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address.number"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-sm font-semibold text-gray-700">
                          Número
                        </Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="N°"
                            className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Piso y Departamento */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.description"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-sm font-semibold text-gray-700">
                          Piso (Opcional)
                        </Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Piso"
                            className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-sm font-semibold text-gray-700">
                          Departamento (Opcional)
                        </Label>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Depto"
                            className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6 hover:bg-gray-50"
              disabled={addCompanyMutations.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={addCompanyMutations.isPending}
              className="px-6 bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md min-w-[160px] flex items-center justify-center"
            >
              {addCompanyMutations.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Guardar Empresa
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
