import { apiLaboral } from "@/services/axiosConfig";
import { SendEmailDto } from "@/types/Email/Email";

export const sendEmail = async (values: SendEmailDto) => {
    const { data } = await apiLaboral.post<string>(`email/send`, values);
    return data;
}
