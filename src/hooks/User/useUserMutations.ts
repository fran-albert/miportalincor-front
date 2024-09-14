import { changePassword } from "@/api/User/change-password.action";
import { forgotPassword } from "@/api/User/forgot-password.action";
import { requestSupport } from "@/api/User/request-support.action";
import { resetDefaultPassword } from "@/api/User/reset-default-password.action";
import { resetPassword } from "@/api/User/reset-password.action";
import { updateUser } from "@/api/User/update-user.action";
import { User } from "@/types/User/User";
import { useMutation } from "@tanstack/react-query";


export const useUserMutations = () => {

    const changePasswordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: (password, variables, context) => {
            console.log("OK", password, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error", error, variables, context);
        },
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: ({ email }: { email: string }) => forgotPassword(email),
        onSuccess: (email, variables, context) => {
            console.log("OK", email, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error", error, variables, context);
        },
    });

    const requestSupportMutation = useMutation({
        mutationFn: (user: any) => requestSupport(user),
        onSuccess: (patient, variables, context) => {
            console.log("OK", patient, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error", error, variables, context);
        },
    });

    const resetPasswordMutation = useMutation({
        mutationFn: (password: any) => resetPassword(password),
        onSuccess: (password, variables, context) => {
            console.log("OK", password, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error", error, variables, context);
        },
    });

    const resetDefaultPasswordMutation = useMutation({
        mutationFn: (idUser: number) => resetDefaultPassword(idUser),
        onSuccess: (password, variables, context) => {
            console.log("OK", password, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error", error, variables, context);
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ user, id }: { user: User, id: number }) => updateUser(user, id),
        onSuccess: (patient, variables, context) => {
            console.log("ok", patient, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error", error, variables, context);
        },
    });

    return { changePasswordMutation, updateUserMutation, resetPasswordMutation, requestSupportMutation, forgotPasswordMutation, resetDefaultPasswordMutation };
};
