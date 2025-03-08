"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Configuración del worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface GetUrlsResponseDto {
  url: string;
  dataTypeName: string;
  fileName?: string;
}

interface StudiesPreviewProps {
  studies: GetUrlsResponseDto[];
}

interface PDFPageAsImageProps {
  fileUrl: string;
  pageNumber: number;
}

const PDFPageAsImage = ({ fileUrl, pageNumber }: PDFPageAsImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageData, setImageData] = useState<string>("");
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const loadPageDimensions = async () => {
    const pdf = await pdfjs.getDocument(fileUrl).promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.0 }); // Escala 1 para tamaño original
    setPageDimensions({
      width: viewport.width,
      height: viewport.height,
    });
  };

  const onRenderSuccess = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setImageData(dataUrl);
    }
  };

  useEffect(() => {
    loadPageDimensions();
  }, [fileUrl, pageNumber]);

  return (
    <div className="mb-4">
      <div style={{ display: "none" }}>
        <Document file={fileUrl}>
          <Page
            pageNumber={pageNumber}
            width={pageDimensions?.width} // Usamos el ancho original
            onRenderSuccess={onRenderSuccess}
            canvasRef={canvasRef}
          />
        </Document>
      </div>
      {imageData && pageDimensions ? (
        <img
          src={imageData}
          alt={`Página ${pageNumber}`}
          style={{
            width: `${pageDimensions.width}px`, // Tamaño original
            height: `${pageDimensions.height}px`, // Tamaño original
          }}
        />
      ) : (
        <p>Cargando página {pageNumber}...</p>
      )}
    </div>
  );
};

export default function StudiesPreview({ studies }: StudiesPreviewProps) {
  const [numPagesArray, setNumPagesArray] = useState<number[]>([]);

  const onDocumentLoadSuccess = (pdf: any, index: number) => {
    setNumPagesArray((prev) => {
      const newArr = [...prev];
      newArr[index] = pdf.numPages;
      return newArr;
    });
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="text-lg font-bold text-greenPrimary">Estudios Subidos</h3>
      {studies.length === 0 ? (
        <p>No hay estudios subidos.</p>
      ) : (
        <div className="space-y-8">
          {studies.map((study, studyIndex) => (
            <div
              key={`${study.dataTypeName}-${studyIndex}`}
              className="border rounded p-4"
            >
              <h4 className="font-semibold mb-2">{study.dataTypeName}</h4>
              <Document
                file={study.url}
                onLoadSuccess={(pdf) => onDocumentLoadSuccess(pdf, studyIndex)}
              >
                {Array.from(
                  new Array(numPagesArray[studyIndex] || 1),
                  (_, pageIndex) => (
                    <PDFPageAsImage
                      key={`page_${pageIndex + 1}`}
                      fileUrl={study.url}
                      pageNumber={pageIndex + 1}
                    />
                  )
                )}
              </Document>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
