import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { toast } from "sonner";
import ActionIcon from "@/components/Icons/action";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { BiMailSend } from "react-icons/bi";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { emailSchema } from "@/validators/Email/send.email.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SendEmailDto } from "@/types/Email/Email";
import { useEmailMutations } from "@/hooks/Email/useEmailMutations";

interface Props {
  collaborator: Collaborator;
  url: string;
  evaluationType: string;
}

export default function SendEmailDialog({
  collaborator,
  url,
  evaluationType,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      to: collaborator.company.email,
      subject: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { reset } = form;
  const { sendEmailMutation } = useEmailMutations();

  useEffect(() => {
    if (isOpen) {
      reset({
        to: collaborator.company.email,
        subject: "",
      });
    }
  }, [isOpen, reset, collaborator.company.email]);

  async function onSubmit(values: z.infer<typeof emailSchema>) {
    setIsSubmitting(true);
    try {
      const payload: SendEmailDto = {
        ...values,
        collaboratorName: collaborator.firstName + " " + collaborator.lastName,
        evaluationType: evaluationType,
        fileData: url,
      };
      const promise = sendEmailMutation.mutateAsync(payload);
      toast.promise(promise, {
        loading: <LoadingToast message="Enviando PDF por Email..." />,
        success: <SuccessToast message="PDF enviado con éxito!" />,
        error: <ErrorToast message="Hubo un error al enviar el PDF." />,
      });
      promise
        .then(() => {
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Error al enviar el PDF", error);
        });
    } catch (error) {
      console.error("Error al enviar el PDF", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggleDialog}>
          <ActionIcon
            tooltip="Enviar"
            icon={<BiMailSend className="w-4 h-4" color="green" />}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Enviar Examen Vía Email</DialogTitle>
              <DialogDescription>
                Complete el formulario para enviar un correo electrónico con los
                resultados de exámenes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="to" className="text-right">
                  Para
                </Label>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input id="to" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Asunto
                </Label>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input id="subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={toggleDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || sendEmailMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Enviando..." : "Enviar Email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
