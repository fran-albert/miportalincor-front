import { changePassword } from "@/api/User/change-password.action";
import { forgotPassword } from "@/api/User/forgot-password.action";
import { resetPasswordToDni } from "@/api/User/reset-password-to-dni.action";
import { resetPassword } from "@/api/User/reset-password.action";
import { updateUser } from "@/api/User/update-user.action";
import { activateUser } from "@/api/User/activate-user.action";
import { deactivateUser } from "@/api/User/deactivate-user.action";
import { User } from "@/types/User/User";
import { useMutation } from "@tanstack/react-query";

interface ResetPasswordDto {
    password: string;
    confirmPassword: string;
    code: string; // token from email link
}

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

    const resetPasswordMutation = useMutation({
        mutationFn: (password: ResetPasswordDto) => resetPassword(password),
        onSuccess: (password, variables, context) => {
            console.log("OK", password, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error", error, variables, context);
        },
    });

    const resetPasswordToDniMutation = useMutation({
        mutationFn: (userName: string) => resetPasswordToDni(userName),
        onSuccess: (response, variables, context) => {
            console.log("Password reset to DNI", response, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error resetting password", error, variables, context);
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ user, userId }: { user: Partial<User>, userId: string }) => updateUser(user, userId),
        onSuccess: (patient, variables, context) => {
            console.log("ok", patient, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error", error, variables, context);
        },
    });

    const activateUserMutation = useMutation({
        mutationFn: (userId: string) => activateUser(userId),
        onSuccess: (user, variables, context) => {
            console.log("User activated", user, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error activating user", error, variables, context);
        },
    });

    const deactivateUserMutation = useMutation({
        mutationFn: (userId: string) => deactivateUser(userId),
        onSuccess: (user, variables, context) => {
            console.log("User deactivated", user, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deactivating user", error, variables, context);
        },
    });

    return {
        changePasswordMutation,
        updateUserMutation,
        resetPasswordMutation,
        forgotPasswordMutation,
        resetPasswordToDniMutation,
        activateUserMutation,
        deactivateUserMutation
    };
};
