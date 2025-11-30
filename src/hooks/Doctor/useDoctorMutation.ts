import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDoctor } from "@/api/Doctor/create-doctor.action";
import { updateDoctor } from "@/api/Doctor/update-doctor.action";
import { deleteDoctor } from "@/api/Doctor/delete-doctor.action";
import {
  uploadSignature,
  UploadSignatureProps,
} from "@/api/Doctor/upload-signature.action";
import {
  uploadSello,
  UploadSelloProps,
} from "@/api/Doctor/upload-sello.action";
import { UpdateDoctorDto } from "@/types/Doctor/UpdateDoctor.dto";

export const useDoctorMutations = () => {
  const queryClient = useQueryClient();

  const addDoctorMutation = useMutation({
    mutationFn: createDoctor,
    onSuccess: (doctor, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      console.log("OK", doctor, variables, context);
    },

    onError: (error, variables, context) => {
      console.log("Error", error, variables, context);
    },
  });

  const uploadSignatureMutation = useMutation({
    mutationFn: async (values: UploadSignatureProps) => {
      return await uploadSignature(values);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.idUser] });
      console.log("Firma subida correctamente", data);
    },
    onError: (error, variables, context) => {
      console.error("Error al subir la firma", error, variables, context);
    },
  });

  const uploadSelloMutation = useMutation({
    mutationFn: async (values: UploadSelloProps) => {
      return await uploadSello(values);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.idUser] });
      console.log("Sello subida correctamente", data);
    },
    onError: (error, variables, context) => {
      console.error("Error al subir Sello", error, variables, context);
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: ({ id, doctor }: { id: string; doctor: UpdateDoctorDto }) =>
      updateDoctor(id, doctor),
    onSuccess: (doctor, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["doctor", variables.id] });
      console.log("OK", doctor, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error", error, variables, context);
    },
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: (id: string) => deleteDoctor(id),
    onSuccess: (doctor, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      console.log("ok", doctor, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error deleting patient", error, variables, context);
    },
  });

  return {
    addDoctorMutation,
    updateDoctorMutation,
    deleteDoctorMutation,
    uploadSelloMutation,
    uploadSignatureMutation,
  };
};
