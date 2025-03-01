import { sendEmail } from "@/api/Email/send.email.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEmailMutations = () => {
    const queryClient = useQueryClient();

    const sendEmailMutation = useMutation({
        mutationFn: sendEmail,
        onSuccess: async (response) => {
            await queryClient.invalidateQueries({ queryKey: ['send-email', response] });
            console.log(response, "created")
        },
        onError: (error) => {
            console.error("Error", error);
        },
    });

    return { sendEmailMutation };
};

