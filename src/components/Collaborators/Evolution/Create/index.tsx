import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  evolutionSchema,
  type EvolutionFormData,
} from "@/validators/evolution.schema";
import { useEmailMutations } from "@/hooks/Email/useEmailMutations";
import { useEvolutionMutations } from "@/hooks/Evolutions/useEvolutionMutations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SuccessToast from "@/components/Toast/Success";
import LoadingToast from "@/components/Toast/Loading";
import ErrorToast from "@/components/Toast/Error";
interface Props {
  setEvolutionView: React.Dispatch<
    React.SetStateAction<"menu" | "list" | "new">
  >;
  collaboratorId: number;
  doctorId: number;
  companyEmail?: string;
}

const CreateCollaboratorEvolution: React.FC<Props> = ({
  setEvolutionView,
  collaboratorId,
  doctorId,
  companyEmail,
}) => {
  const { sendEmailNoteToCompanyMutation } = useEmailMutations();
  const { createEvolutionMutation } = useEvolutionMutations();

  const form = useForm<EvolutionFormData>({
    resolver: zodResolver(evolutionSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      doctor: "",
      specialty: "",
      consultationReason: "",
      currentIllness: "",
      companyNote: "",
      sendEmail: false,
      companyEmail: companyEmail, // Use the passed company email or default to empty string
    },
  });

  const onSubmit = async (data: EvolutionFormData) => {
    try {
      // Create evolution payload
      const evolutionPayload = {
        collaboratorId,
        doctorId,
        evolutionData: {
          fechaDiagnostico: data.date,
          motivoConsulta: data.consultationReason,
          notasEmpresa: data.companyNote,
          enfermedadActual: data.currentIllness,
        },
      };

      // Create evolution
      const evolutionPromise =
        createEvolutionMutation.mutateAsync(evolutionPayload);

      toast.promise(evolutionPromise, {
        loading: <LoadingToast message="Creando evolución..." />,
        success: <SuccessToast message="Evolución creada con éxito" />,
        error: (error) => {
          const errorMessage =
            error.response?.data?.message || "Error al crear la evolución";
          return <ErrorToast message={errorMessage} />;
        },
      });

      await evolutionPromise;

      // Send email if requested
      if (data.sendEmail && data.companyNote && companyEmail) {
        const emailPayload = {
          to: companyEmail,
          subject: `Nota de Evolución Médica - ${data.doctor}`,
          text: data.companyNote,
        };

        const emailPromise =
          sendEmailNoteToCompanyMutation.mutateAsync(emailPayload);

        toast.promise(emailPromise, {
          loading: <LoadingToast message="Enviando email..." />,
          success: <SuccessToast message="Email enviado con éxito" />,
          error: (error) => {
            const errorMessage =
              error.response?.data?.message || "Error al enviar el email";
            return <ErrorToast message={errorMessage} />;
          },
        });

        await emailPromise;
      }

      setEvolutionView("list");
    } catch (error) {
      console.error("Error al procesar la evolución:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Nueva Evolución</h3>
        <Button variant="ghost" onClick={() => setEvolutionView("menu")}>
          Volver
        </Button>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doctor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del doctor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidad</FormLabel>
                      <FormControl>
                        <Input placeholder="Especialidad médica" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="consultationReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo de Consulta</FormLabel>
                      <FormControl>
                        <Input placeholder="Motivo de la consulta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="currentIllness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enfermedad Actual</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción de la enfermedad actual..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">NOTA A EMPRESAS</h4>
                <FormField
                  control={form.control}
                  name="companyNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Escriba aquí la nota para la empresa..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sendEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enviar mail a la empresa</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("sendEmail") && (
                  <FormField
                    control={form.control}
                    name="companyEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de la Empresa</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={companyEmail} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-greenPrimary hover:bg-teal-600 text-white"
                  disabled={
                    createEvolutionMutation.isPending ||
                    sendEmailNoteToCompanyMutation.isPending
                  }
                >
                  Guardar Evolución
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEvolutionView("list")}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCollaboratorEvolution;
