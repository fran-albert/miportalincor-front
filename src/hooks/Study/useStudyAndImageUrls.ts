import { useQuery } from "@tanstack/react-query";
import { getUrlByUserId } from "@/api/Study/get-url-by-idUser.action";
import { Study } from "@/types/Study/Study";

export const useStudyAndImageUrls = (idUser: number | undefined, studies: Study[]) => {
    return useQuery({
        queryKey: ["studyAndImageUrls", { idUser, studies }],
        queryFn: async () => {
            if (!idUser) return {};
            const allUrls: { [key: number]: { pdfUrl?: string, imageUrls?: string[] } } = {};

            await Promise.all(
                studies.map(async (study) => {
                    if (study.locationS3 && study.locationS3 !== "temp-location.pdf") {
                        const pdfUrl = await getUrlByUserId(idUser, study.locationS3);
                        allUrls[study.id] = { pdfUrl };
                    }
                    if (study.ultrasoundImages && study.ultrasoundImages.length > 0) {
                        const imageUrls = await Promise.all(
                            study.ultrasoundImages.map(async (image) => {
                                const imageUrl = await getUrlByUserId(idUser, image.locationS3);
                                return imageUrl;
                            })
                        );

                        allUrls[study.id] = {
                            ...allUrls[study.id],
                            imageUrls
                        };
                    }
                })
            );
            return allUrls;
        },
        staleTime: 10000,
        enabled: !!idUser && studies.length > 0,
    });
};
