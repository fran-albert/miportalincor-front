import { getPatients } from "@/api/Patient/get-all-patients.action";
import { getLastPatients } from "@/api/Patient/get-last-patients.action";
import { getTotalPatients } from "@/api/Patient/get-total-patients.action";
import { useQuery } from "@tanstack/react-query"
import { useState } from "react";

interface Props {
    auth: boolean;
    fetchPatients: boolean;
}

export const usePatients = ({ auth, fetchPatients }: Props) => {
    const [page, setPage] = useState(1);

    const { isLoading, isError, error, data: patients = [], isFetching } = useQuery({
        queryKey: ['patients'],
        queryFn: () => getPatients(),
        staleTime: 1000 * 60,
        enabled: auth && fetchPatients
    });

    const { isLoading: isLoadingLastPatients, isError: isErrorLastPatients, error: errorLastPatients, data: lastedpatients = 0 } = useQuery({
        queryKey: ["lastPatients"],
        queryFn: () => getLastPatients(),
        staleTime: 1000 * 60,
        enabled: auth
    });

    const { isLoading: isLoadingTotalPatients, isError: isErrorTotalPatients, error: errorTotalPatients, data: totalPatients = 0 } = useQuery({
        queryKey: ["totalPatients"],
        queryFn: () => getTotalPatients(),
        staleTime: 1000 * 60,
        enabled: auth
    });

    const nextPage = () => {
        if (patients?.length === 0) return;
        setPage((old) => old + 1);
    };

    const prevPage = () => {
        if (page === 1) return;
        setPage((old) => Math.max(old - 1, 1));
    };


    return {
        patients,
        error,
        isLoading,
        isError, isFetching,
        isLoadingTotalPatients, isErrorTotalPatients, errorTotalPatients, totalPatients,
        lastedpatients,
        isLoadingLastPatients,
        isErrorLastPatients,
        errorLastPatients,
        nextPage,
        prevPage
    }

}