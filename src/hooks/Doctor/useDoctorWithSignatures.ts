// src/hooks/Doctor/useDoctorWithSignatures.ts
import { useQuery } from "@tanstack/react-query"
import { fetchImageAsDataUrl } from "@/api/Study/Collaborator/get-proxy-url.action"
import { apiIncorHC } from "@/services/axiosConfig"

export type DoctorSignatureAssetStatus = "available" | "missing" | "broken"

export interface DoctorSignatures {
    fullName: string
    matricula: string
    specialty: string
    stampText: string
    signatureStatus: DoctorSignatureAssetStatus
    sealStatus: DoctorSignatureAssetStatus
    signatureDataUrl?: string
    sealDataUrl?: string
}

interface DoctorSignatureResponse {
    fullName?: string
    matricula?: string
    doctorSpeciality?: string
    stampText?: string
    signature?: string
    signatureStatus?: DoctorSignatureAssetStatus
    sello?: string
    selloStatus?: DoctorSignatureAssetStatus
}

interface Params {
    id: string
    auth?: boolean
}

export const useDoctorWithSignatures = ({ id, auth = true }: Params) => {
    return useQuery<DoctorSignatures>({
        queryKey: ["doctor", id, "signatures"],
        queryFn: async () => {
            // 1) Consulta al endpoint con axios (patientUserId es opcional)
            const res = await apiIncorHC.get<{ doctorSignature: DoctorSignatureResponse }>(
                `/study/signature?doctorUserId=${id}`
            )

            const sig = res.data.doctorSignature

            const signatureStatus = sig?.signatureStatus ?? (sig?.signature ? "available" : "missing")
            const sealStatus = sig?.selloStatus ?? (sig?.sello ? "available" : "missing")

            const [signatureAsset, sealAsset] = await Promise.all([
                resolveImageDataUrl(sig?.signature, signatureStatus),
                resolveImageDataUrl(sig?.sello, sealStatus),
            ])

            return {
                fullName: sig?.fullName ?? "",
                matricula: sig?.matricula ?? "",
                specialty: sig?.doctorSpeciality ?? "",
                stampText: sig?.stampText ?? "",
                signatureStatus: signatureAsset.status,
                sealStatus: sealAsset.status,
                signatureDataUrl: signatureAsset.dataUrl,
                sealDataUrl: sealAsset.dataUrl,
            }
        },
        enabled: auth && Boolean(id),
        staleTime: 1000 * 60, // 1 minuto
    })
}

async function resolveImageDataUrl(
    url: string | undefined,
    status: DoctorSignatureAssetStatus,
): Promise<{ dataUrl?: string; status: DoctorSignatureAssetStatus }> {
    if (status !== "available" || !url) {
        return { status }
    }

    try {
        return {
            dataUrl: await fetchImageAsDataUrl(url),
            status: "available",
        }
    } catch (error) {
        console.warn("No se pudo resolver la firma/sello del médico", error)
        return { status: "broken" }
    }
}
