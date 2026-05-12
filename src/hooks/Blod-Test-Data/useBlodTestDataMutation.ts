import { createBlodTestData } from "@/api/Blod-Test-Data/create-blod-test-data.action";
import { updateBlodTestData } from "@/api/Blod-Test-Data/update-blod-test-data.action";
import { updateManualBloodTestStudyDate } from "@/api/Blod-Test-Data/update-manual-blood-test-study-date.action";
import { BloodTestDataUpdateRequestItem } from "@/types/Blod-Test-Data/Blod-Test-Data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bloodTestDataKeys } from "./useBlodTestData";

export const useBlodTestDataMutations = () => {
    const queryClient = useQueryClient();

    const addBlodTestDataMutation = useMutation({
        mutationFn: createBlodTestData,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["studiesByUserId"] });
            await queryClient.invalidateQueries({ queryKey: ["studies-with-urls"] });
            await queryClient.invalidateQueries({ queryKey: bloodTestDataKeys.lists() });
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
            idStudy: number | string;
            bloodTestDataRequests: BloodTestDataUpdateRequestItem[];
        }) => updateBlodTestData(String(idStudy), bloodTestDataRequests),
        onSuccess: async () => {
            // Invalidar todas las listas de blood test data (dispara refetch automático)
            await queryClient.invalidateQueries({ queryKey: ["studiesByUserId"] });
            await queryClient.invalidateQueries({ queryKey: bloodTestDataKeys.lists() });
        },
        onError: (error) => {
            console.error("Error updating bloodTest", error);
        },
    });

    const updateManualBloodTestStudyDateMutation = useMutation({
        mutationFn: ({ idStudy, date }: { idStudy: number | string; date: string }) =>
            updateManualBloodTestStudyDate(String(idStudy), date),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["studiesByUserId"] });
            await queryClient.invalidateQueries({ queryKey: ["studies-with-urls"] });
            await queryClient.invalidateQueries({ queryKey: bloodTestDataKeys.lists() });
        },
        onError: (error) => {
            console.error("Error updating manual blood test date", error);
        },
    });

    return {
        addBlodTestDataMutation,
        updateBlodTestMutation,
        updateManualBloodTestStudyDateMutation,
    };
};
