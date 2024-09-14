import { Doctor } from "@/types/Doctor/Doctor";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { Study } from "@/types/Study/Study";
import StudiesComponent from "@/components/Studies/Component";
import DoctorCardComponent from "../View/Card/card";
export function DoctorComponent({
  doctor,
  urls,
  studiesByUserId,
}: {
  doctor: Doctor | undefined;
  urls: any;
  studiesByUserId: Study[];
}) {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Médicos", href: "/medicos" },
    {
      label: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico",
      href: `/medicos/${doctor?.slug}`,
    },
  ];
  return (
    <div className="container space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <div className="md:grid md:grid-cols-[320px_1fr] gap-6">
        {doctor && <DoctorCardComponent doctor={doctor} />}
        <div className="md:grid md:gap-6 space-y-4">
          <StudiesComponent
            idUser={Number(doctor?.userId)}
            studiesByUserId={studiesByUserId}
            role="medicos"
            urls={urls}
            slug={String(doctor?.slug)}
          />
          {/* <StudiesCardComponent idUser={Number(doctor?.userId)} /> */}
        </div>
      </div>
    </div>
  );
}
