import { getDoctors } from "@/api/Doctor/get-all-doctors.action";
import { getLastDoctors } from "@/api/Doctor/get-last-doctors.action";
import { getTotalDoctors } from "@/api/Doctor/get-total-doctors.action";
import { useQuery } from "@tanstack/react-query"
import { useState } from "react";

interface Props {
    auth: boolean;
    fetchDoctors: boolean;
}

export const useDoctors = ({ auth, fetchDoctors }: Props) => {
    const [page, setPage] = useState(1);

    const { isLoading, isError, error, data: doctors = [], isFetching } = useQuery({
        queryKey: ['doctors'],
        queryFn: () => getDoctors(),
        staleTime: 1000 * 60,
        enabled: auth && fetchDoctors   
    });

    const { isLoading: isLoadingLastDoctors, isError: isErrorLastDoctors, error: errorLastDoctors, data: lastedDoctors = 0 } = useQuery({
        queryKey: ["lastDoctors"],
        queryFn: () => getLastDoctors(),
        staleTime: 1000 * 60,
        enabled: auth
    });

    const { isLoading: isLoadingTotalDoctors, isError: isErrorTotalDoctors, error: errorTotalDoctors, data: totalDoctors = 0 } = useQuery({
        queryKey: ["totalDoctors"],
        queryFn: () => getTotalDoctors(),
        staleTime: 1000 * 60,
        enabled: auth
    });



    const nextPage = () => {
        if (doctors?.length === 0) return;
        setPage((old) => old + 1);
    };

    const prevPage = () => {
        if (page === 1) return;
        setPage((old) => Math.max(old - 1, 1));
    };


    return {
        doctors,
        error,
        isLoading,
        isError, isFetching,
        isLoadingTotalDoctors, isErrorTotalDoctors, errorTotalDoctors, totalDoctors,
        lastedDoctors,
        isLoadingLastDoctors,
        isErrorLastDoctors,
        errorLastDoctors,
        nextPage,
        prevPage
    }

}