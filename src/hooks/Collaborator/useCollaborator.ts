import { getCollaboratorById } from "@/api/Collaborator/get-collaborator-by-id.action";
import { useQuery } from "@tanstack/react-query";

interface Props {
    auth?: boolean;
    id: number;
}

export const useCollaborator = ({ auth, id }: Props) => {
    const { isLoading, isError, error, data, isFetching } = useQuery({
        queryKey: ['collaborator', id],
        queryFn: async () => {
            const response = await getCollaboratorById(id as number);

            // Procesar el photoBuffer si existe
            if (response?.photoBuffer) {
                // Comprobar si photoBuffer tiene el formato { type: 'Buffer', data: [...] }
                const bufferData = response.photoBuffer.data || response.photoBuffer;

                // Convertir el array de bytes a una cadena base64
                const base64String = arrayBufferToBase64(bufferData);

                // Determinar el tipo MIME basado en la extensión del archivo original
                let mimeType = 'image/jpeg'; // Por defecto
                if (response.photoUrl) {
                    const extension = response.photoUrl.split('.').pop()?.toLowerCase();
                    if (extension === 'png') mimeType = 'image/png';
                    else if (extension === 'gif') mimeType = 'image/gif';
                    else if (extension === 'webp') mimeType = 'image/webp';
                    else if (extension === 'svg') mimeType = 'image/svg+xml';
                }

                // Crear y asignar URL de datos
                response.photoDataUrl = `data:${mimeType};base64,${base64String}`;
            }

            return response;
        },
        staleTime: 0,
        refetchOnMount: "always",
        enabled: Boolean(auth) && id !== undefined,
    });

    // Función auxiliar para convertir un array de bytes a base64
    function arrayBufferToBase64(buffer: number[]): string {
        // Convertir el array de bytes a una cadena de caracteres
        const binary = buffer.map(byte => String.fromCharCode(byte)).join('');
        // Convertir la cadena de caracteres a base64
        return window.btoa(binary);
    }

    return {
        collaborator: data,
        error,
        isLoading,
        isError,
        isFetching,
    };
};