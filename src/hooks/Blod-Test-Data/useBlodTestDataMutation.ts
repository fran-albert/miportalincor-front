import { createBlodTestData } from "@/api/Blod-Test-Data/create-blod-test-data.action";
import { updateBlodTestData } from "@/api/Blod-Test-Data/update-blod-test-data.action";
import { BloodTestDataUpdateRequestItem, BloodTestDataResponse } from "@/types/Blod-Test-Data/Blod-Test-Data";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useBlodTestDataMutations = () => {
    const queryClient = useQueryClient();

    const addBlodTestDataMutation = useMutation({
        mutationFn: createBlodTestData,
        onSuccess: async (response) => {
            // Invalidar la query y esperar a que se actualice
            await queryClient.invalidateQueries({ queryKey: ['bloodTestsData'] });

            // Actualizar los datos en caché inmediatamente
            queryClient.setQueryData(['bloodTestsData'], (oldData: BloodTestDataResponse[] | undefined) => {
                if (!oldData) return oldData;
                return [...oldData, response];
            });
        },
        onError: (error) => {
            console.error("Error creating blodTest", error);
        },
    });

    const updateBlodTestMutation = useMutation({
        mutationFn: ({
            idStudy,
            bloodTestDataRequests,
        }: {
            idStudy: number;
            bloodTestDataRequests: BloodTestDataUpdateRequestItem[];
        }) => updateBlodTestData(String(idStudy), bloodTestDataRequests),
        onSuccess: async () => {
            // Invalidar y refetch inmediato
            await queryClient.invalidateQueries({ queryKey: ['bloodTestsData'] });
        },
        onError: (error) => {
            console.error("Error updating bloodTest", error);
        },
    });

    return { addBlodTestDataMutation, updateBlodTestMutation };
};

