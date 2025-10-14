// src/hooks/Doctor/useDoctorWithSignatures.ts
import { useQuery } from "@tanstack/react-query"
import { fetchImageAsDataUrl } from "@/api/Study/Collaborator/get-proxy-url.action"
import { apiIncor } from "@/services/axiosConfig"

// Firma por defecto
const DEFAULT_SIGNATURE_URL =
    "https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"

export interface DoctorSignatures {
    fullName: string
    matricula: string
    specialty: string
    signatureDataUrl: string
    sealDataUrl?: string
}

interface DoctorSignatureResponse {
    fullName?: string
    matricula?: string
    doctorSpeciality?: string
    signature?: string
    sello?: string
}

interface Params {
    id: number
    auth?: boolean
}

export const useDoctorWithSignatures = ({ id, auth = true }: Params) => {
    return useQuery<DoctorSignatures>({
        queryKey: ["doctor", id, "signatures"],
        queryFn: async () => {
            // 1) Consulta al endpoint con axios
            const res = await apiIncor.get<{ doctorSignature: DoctorSignatureResponse }>(
                `/Study/signature?doctorUserId=${id}`
            )

            const sig = res.data.doctorSignature

            // 2) Decidir URL de firma y sello
            const sigUrl = sig?.signature ?? DEFAULT_SIGNATURE_URL
            const selloUrl = sig?.sello

            // 3) Transformar a data URLs
            const [signatureDataUrl, sealDataUrl] = await Promise.all([
                fetchImageAsDataUrl(sigUrl),
                selloUrl ? fetchImageAsDataUrl(selloUrl) : Promise.resolve(undefined),
            ])

            return {
                fullName: sig?.fullName ?? "",
                matricula: sig?.matricula ?? "",
                specialty: sig?.doctorSpeciality ?? "",
                signatureDataUrl,
                sealDataUrl,
            }
        },
        enabled: auth && Boolean(id),
        staleTime: 1000 * 60, // 1 minuto
    })
}
