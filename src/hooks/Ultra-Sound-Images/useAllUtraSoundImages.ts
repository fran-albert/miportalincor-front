import { useQuery } from "@tanstack/react-query";
import { getUrlByUserId } from "@/api/Study/get-url-by-idUser.action";
import { Study } from "@/types/Study/Study";
import { getUltraSoundImages } from "@/api/Study/Ultra-Sounds/get-ultra-sound-image.action";
import { UltraSoundImages } from "@/types/Ultra-Sound/Ultra-Sound";

export const useAllUltraSoundImages = (idUser: number | undefined, studies: Study[]) => {
    return useQuery({
        queryKey: ["ultraSoundImages", { idUser, studies }],
        queryFn: async () => {
            if (!idUser) return {};
            const allImages: Record<string | number, string[]> = {};
            await Promise.all(
                studies.map(async (study) => {
                    if (Number(study.studyType?.id) === 2) {
                        const images: UltraSoundImages[] = await getUltraSoundImages(String(study.id));
                        const imageUrls = await Promise.all(
                            images.map(async (image) => {
                                const url = await getUrlByUserId(idUser, image.locationS3);
                                return url;
                            })
                        );
                        allImages[study.id] = imageUrls;
                    }
                })
            );
            return allImages;
        },
        staleTime: 1000 * 60,
        enabled: !!idUser && studies.length > 0,
    });
};
