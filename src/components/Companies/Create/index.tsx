import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { companySchema } from "@/validators/Company/company.schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { useEffect } from "react";
import { useCompanyMutations } from "@/hooks/Company/useCompanyMutations";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateCompanyDialog({ isOpen, setIsOpen }: Props) {
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
  });
  const { addCompanyMutations } = useCompanyMutations();
  const toggleDialog = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form.reset]);

  async function onSubmit(values: z.infer<typeof companySchema>) {
    try {
      const promise = addCompanyMutations.mutateAsync(values);
      toast.promise(promise, {
        loading: <LoadingToast message="Creando Empresa..." />,
        success: <SuccessToast message="Empresa creada con éxito!" />,
        error: <ErrorToast message="Hubo un error al crear la empresa." />,
      });
      promise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al crear la empresa", error);
        });
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
            {/** Grupo de Campos */}
            <div className="grid gap-4">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-black"> Nombre</Label>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dirección */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-black">Dirección</Label>
                    <FormControl>
                      <Input {...field} />
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
                    <Label className="text-black"> CUIT</Label>
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
                      <Input {...field} type="email" />
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
                    <Label className="text-black"> Teléfono</Label>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botón de Guardar */}
            <Button
              type="submit"
              disabled={addCompanyMutations.isPending}
              className="w-full  text-white bg-greenPrimary hover:bg-greenPrimary"
            >
              Guardar Empresa
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
