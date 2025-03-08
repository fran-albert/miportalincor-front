import { useState, RefObject } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useUploadStudyFileMutation } from "../Study/useUploadStudyFileCollaborator";

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

interface GeneratePDFProps {
    collaboratorUserName: string; 
    collaboratorId: number;
    refs: PDFRefs;
}

export const useGeneratePDF = ({ collaboratorUserName, refs, collaboratorId }: GeneratePDFProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { mutateAsync: uploadStudyFile } = useUploadStudyFileMutation({ collaboratorId });

    const handleSaveAndGeneratePdf = async () => {
        setIsGenerating(true);

        const sections: RefObject<HTMLDivElement>[] = [
            refs.pdfHeaderRef,
            refs.pdfGeneralInfoRef,
            refs.pdfMiddleRef,
            refs.pdfRestRef,
            refs.pdfMedicalEvalRef,
            refs.pdfPhysicalEvalSection1Ref,
            refs.pdfPhysicalEvalSection2Ref,
            refs.pdfPhysicalEvalSection3Ref,
        ];

        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let pageNumber = 1;

            const captureSection = async (ref: RefObject<HTMLDivElement>) => {
                if (!ref.current) return null;
            
                // Hacer visible el elemento temporalmente sin afectar el flujo de la página
                ref.current.style.visibility = "visible";
                ref.current.style.position = "absolute";
                ref.current.style.top = "0";
                ref.current.style.left = "0";
                ref.current.style.width = "100%";
            
                // Esperar un breve tiempo para que el navegador renderice el contenido
                await new Promise((resolve) => setTimeout(resolve, 100));
            
                // Capturar con html2canvas
                const canvas = await html2canvas(ref.current, {
                    scale: 2,
                    useCORS: true,
                    width: ref.current.offsetWidth,
                    height: ref.current.offsetHeight,
                });
            
                // Restaurar el estado original del elemento
                ref.current.style.visibility = "hidden";
                ref.current.style.position = "absolute";
                ref.current.style.top = "-9999px";
                ref.current.style.left = "-9999px";
            
                return canvas;
            };
            
            

            const addPageWithNumber = (imgData: string, pdfHeight: number) => {
                let heightLeft = pdfHeight;
                let position = 0;
                while (heightLeft > 0) {
                    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
                    pdf.setFontSize(10);
                    pdf.text(`Página ${pageNumber}`, pdfWidth - 20, pageHeight - 10, {
                        align: "right",
                    });
                    pageNumber++;
                    heightLeft -= pageHeight;
                    position -= pageHeight;
                    if (heightLeft > 0) {
                        pdf.addPage();
                    }
                }
            };

            for (const sectionRef of sections) {
                const canvas = await captureSection(sectionRef);
                if (!canvas) throw new Error("No se pudo capturar una sección del contenido.");

                const imgData = canvas.toDataURL("image/png");
                const imgProps = pdf.getImageProperties(imgData);
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                if (sectionRef !== refs.pdfHeaderRef) pdf.addPage();
                addPageWithNumber(imgData, pdfHeight);
            }

            const pdfBlob = pdf.output("blob");

            const formData = new FormData();
            formData.append("file", pdfBlob, `pre_occupational_preview_${collaboratorUserName}.pdf`);
            formData.append("studyType", "Pre-Occupational");

            await uploadStudyFile({ collaboratorId, formData });

            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `pre_occupational_preview_${collaboratorUserName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error al generar el PDF:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return { isGenerating, handleSaveAndGeneratePdf };
};
