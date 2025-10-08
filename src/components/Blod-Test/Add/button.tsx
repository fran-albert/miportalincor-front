import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useBlodTestMutations } from "@/hooks/Blod-Test/useBlodTestMutation";
import { bloodTestSchema } from "@/validators/Blod-Test/blod-test.schema";
import { UnitSelect } from "@/components/Select/Unit/select";
import { AlertCircle, HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddBlodTestDialog({ isOpen, setIsOpen }: Props) {
  const { addBlodTestMutation } = useBlodTestMutations();
  const { promiseToast } = useToastContext();
  const toggleDialog = () => setIsOpen(!isOpen);
  const form = useForm<z.infer<typeof bloodTestSchema>>({
    resolver: zodResolver(bloodTestSchema),
  });

  const { reset } = form;

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  async function onSubmit(values: z.infer<typeof bloodTestSchema>) {
    try {
      const payload = {
        originalName: values.originalName,
        parsedName: values.originalName.toLowerCase().replace(/\s+/g, ""),
        referenceValue: values.referenceValue,
        idUnit: values.unit?.id,
      };

      const promise = addBlodTestMutation.mutateAsync(payload);

      await promiseToast(promise, {
        loading: {
          title: "Creando análisis bioquímico...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Análisis bioquímico creado!",
          description: "El análisis bioquímico se ha creado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al crear análisis bioquímico",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error al crear el análisis bioquímico", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Análisis Bioquímico</DialogTitle>
          <DialogDescription>
            Ingrese los datos exactamente como aparecen en el PDF para un
            correcto análisis.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6 py-4">
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md mb-6">
                  <h3 className="font-semibold mb-2">Ejemplo del PDF:</h3>
                  <div className="bg-white p-3 rounded border">
                    <p className="font-mono text-sm">UREMIA</p>
                    <p className="font-mono text-sm">0.51 g/l</p>
                    <p className="font-mono text-sm">
                      Valores de Referencia: 0.15-0.55 g/l
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">
                    Nombre
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="originalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="UREMIA"
                              className="capitalize"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-5 w-5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Ingrese el nombre exactamente como aparece en el PDF
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unidad" className="text-right">
                    Unidad
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({}) => (
                        <FormItem>
                          <FormControl>
                            <UnitSelect control={form.control} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-5 w-5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Ingrese la unidad exactamente como aparece (g/l,
                            mg/dl, etc.)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="valorRef" className="text-right">
                    Valor de Referencia
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="referenceValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="70-110"
                              className="capitalize"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-5 w-5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Campo opcional. Ingrese el rango exactamente como
                            aparece
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md flex items-start mb-6">
              <AlertCircle className="text-yellow-700 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-semibold mb-1">Instrucciones importantes:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>El nombre debe coincidir exactamente (ej: "UREMIA")</li>
                  <li>La unidad debe ser idéntica (ej: "g/l")</li>
                  <li>
                    El valor de referencia es opcional pero debe mantener el
                    formato si se ingresa (ej: "0.15-0.55 g/l")
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between mt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsOpen(false)}
                className="capitalize"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className=" bg-greenPrimary hover:bg-greenPrimary text-white font-bold py-2 px-4 rounded-md transition duration-300 capitalize"
                variant="default"
                disabled={addBlodTestMutation.isPending}
              >
                Confirmar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
