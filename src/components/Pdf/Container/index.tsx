import { RefObject } from "react";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { GetUrlsResponseDto } from "@/api/Study/Collaborator/get-all-urls.collaborators.action";
import AptitudeCertificateHeader from "@/components/Pre-Occupational/Preview/Incor";
import CollaboratorInformationCard from "@/components/Pre-Occupational/Collaborator-Information";
import GeneralInfoPreview from "@/components/Pre-Occupational/Preview/General-Information";
import TestsPreview from "@/components/Pre-Occupational/Preview/Tests";
import ExamsResultsPreview from "@/components/Pre-Occupational/Preview/Exams-Results";
import ConclusionPreview from "@/components/Pre-Occupational/Preview/Conclusion";
import InstitutionInformationPreview from "@/components/Pre-Occupational/Preview/Institution-Information";
import WorkerInformationPreview from "@/components/Pre-Occupational/Preview/Worker-Information";
import OccupationalHistoryPreview from "@/components/Pre-Occupational/Preview/Occupational-History";
import ClinicalEvaluationPreview from "@/components/Pre-Occupational/Preview/Clinical-Evaluation";
import MedicalEvaluationPreview from "@/components/Pre-Occupational/Preview/Medical-Evaluation";
import PhysicalEvaluationPreview from "@/components/Pre-Occupational/Preview/Physical-Evaluation";

interface PDFRefs {
  pdfHeaderRef: RefObject<HTMLDivElement>;
  pdfGeneralInfoRef: RefObject<HTMLDivElement>;
  pdfMiddleRef: RefObject<HTMLDivElement>;
  pdfRestRef: RefObject<HTMLDivElement>;
  pdfMedicalEvalRef: RefObject<HTMLDivElement>;
  pdfPhysicalEvalSection1Ref: RefObject<HTMLDivElement>;
  pdfPhysicalEvalSection2Ref: RefObject<HTMLDivElement>;
  pdfPhysicalEvalSection3Ref: RefObject<HTMLDivElement>;
}

interface PDFContainersProps {
  collaborator: Collaborator;
  urls: GetUrlsResponseDto[] | undefined;
  refs: PDFRefs;
}

export default function PDFContainers({
  collaborator,
  refs,
}: PDFContainersProps) {
  const {
    pdfHeaderRef,
    pdfGeneralInfoRef,
    pdfMiddleRef,
    pdfRestRef,
    pdfMedicalEvalRef,
    pdfPhysicalEvalSection1Ref,
    pdfPhysicalEvalSection2Ref,
    pdfPhysicalEvalSection3Ref,
  } = refs;

  const containerStyle = {
    position: "absolute" as const,
    top: "-9999px",
    left: "-9999px",
    width: "210mm",
    display: "none" as const,
  };

  return (
    <>
      <div
        ref={pdfHeaderRef}
        className="bg-white p-6 space-y-6"
        style={containerStyle}
      >
        <AptitudeCertificateHeader company={collaborator.company} />
        <CollaboratorInformationCard collaborator={collaborator} isForPdf />
      </div>
      <div
        ref={pdfGeneralInfoRef}
        className="bg-white p-6 space-y-6"
        style={containerStyle}
      >
        <GeneralInfoPreview isForPdf />
        <TestsPreview isForPdf />
      </div>
      <div
        ref={pdfMiddleRef}
        className="bg-white p-6 space-y-6"
        style={containerStyle}
      >
        <ExamsResultsPreview isForPdf />
        <ConclusionPreview isForPdf />
      </div>
      <div
        ref={pdfRestRef}
        className="bg-white p-6 space-y-6"
        style={containerStyle}
      >
        <InstitutionInformationPreview isForPdf />
        <WorkerInformationPreview isForPdf />
        <OccupationalHistoryPreview isForPdf />
      </div>
      <div
        ref={pdfMedicalEvalRef}
        className="bg-white p-6 space-y-6"
        style={containerStyle}
      >
        <ClinicalEvaluationPreview isForPdf />
        <MedicalEvaluationPreview isForPdf />
        <PhysicalEvaluationPreview isForPdf section={1} />
      </div>
      <div
        ref={pdfPhysicalEvalSection1Ref}
        className="bg-white p-6 space-y-6"
        style={containerStyle}
      >
        <PhysicalEvaluationPreview isForPdf section={2} />
      </div>
      <div
        ref={pdfPhysicalEvalSection2Ref}
        className="bg-white p-6 space-y-6"
        style={containerStyle}
      >
        <PhysicalEvaluationPreview isForPdf section={3} />
        {/* {urls && <StudiesPreview studies={urls} />} */}
      </div>
      <div
        ref={pdfPhysicalEvalSection3Ref}
        className="bg-white p-6 space-y-6"
        style={containerStyle}
      >
        {/* {urls && <StudiesPreview studies={urls} />} */}
      </div>
    </>
  );
}
