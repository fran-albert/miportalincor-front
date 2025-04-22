import { apiLaboral } from "@/services/axiosConfig";

export async function fetchImageAsDataUrl(presignedUrl: string): Promise<string> {
    // Llamo al proxy de tu backend, pasando la URL presignada como parámetro
    const response = await apiLaboral.get<Blob>("/file/proxy-image", {
        params: { url: presignedUrl },
        responseType: "blob",           // <- muy importante
    });

    // convierto el Blob en Data URL
    const blob = response.data;
    return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") resolve(reader.result);
            else reject("Error convirtiendo blob a dataURL");
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}
