import { Doctor } from "@/types/Doctor/Doctor";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { StudiesWithURL } from "@/types/Study/Study";
import StudiesComponent from "@/components/Studies/Component";
import DoctorCardComponent from "../View/Card/card";
import {
  PatientCardSkeleton,
  StudiesTableSkeleton,
} from "@/components/Skeleton/Patient";
import MedicoDetallePage from "./component";

interface Props {
  doctor: Doctor | undefined;
  studies: StudiesWithURL[] | undefined;
  isLoadingDoctor: boolean;
  isFetchingStudies: boolean;
  isLoadingUrls?: boolean;
  isRefetching?: boolean;
}

export function DoctorComponent({
  doctor,
  studies,
  isLoadingDoctor,
  isFetchingStudies,
}: Props) {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Médicos", href: "/medicos" },
    {
      label: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico",
      href: `/medicos/${doctor?.slug}`,
    },
  ];
  if (!doctor) return null;

  return (
    <div className="">
      {isLoadingDoctor ? (
        <PatientCardSkeleton />
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
