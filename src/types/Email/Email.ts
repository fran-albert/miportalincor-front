export interface SendEmailDto {
    to: string;
    subject: string;
    collaboratorName: string;
    fileData: FileDatum[];
}
export interface FileDatum {
    url: string;
}
