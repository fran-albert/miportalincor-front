import { Doctor } from "@/types/Doctor/Doctor";
import { StudiesWithURL } from "@/types/Study/Study";

import MedicoDetallePage from "./component";
import { DoctorDashboardSkeleton } from "@/components/Skeleton/Doctor";

interface Props {
  doctor: Doctor | undefined;
  studies: StudiesWithURL[] | undefined;
  isLoadingDoctor: boolean;
  isFetchingStudies: boolean;
  isLoadingUrls?: boolean;
  isRefetching?: boolean;
}

export function DoctorComponent({ doctor, isLoadingDoctor }: Props) {
  if (!doctor) return null;

  return (
    <div className="">
      {isLoadingDoctor ? (
        <DoctorDashboardSkeleton />
      ) : (
        doctor && <MedicoDetallePage doctor={doctor} />
      )}
      {/* <div className="md:grid md:gap-6 space-y-4">
          {isFetchingStudies ? (
            <StudiesTableSkeleton />
          ) : (
            studies && (
              <StudiesComponent
                idUser={Number(doctor?.userId)}
                studies={studies}
                role="medicos"
                isFetchingStudies={isFetchingStudies}
                slug={String(doctor?.slug)}
              />
            )
          )}
        </div> */}
    </div>
  );
}
