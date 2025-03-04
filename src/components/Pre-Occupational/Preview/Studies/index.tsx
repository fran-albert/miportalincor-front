"use client";

import { useState, useRef } from "react";
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
  width?: number;
}

const PDFPageAsImage = ({ pageNumber, width = 600 }: PDFPageAsImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageData, setImageData] = useState<string>("");

  const onRenderSuccess = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      setImageData(dataUrl);
    }
  };

  return (
    <div className="mb-4">
      {/* Renderizamos la página en un canvas oculto */}
      <div style={{ display: "none" }}>
        <Page
          pageNumber={pageNumber}
          width={width}
          onRenderSuccess={onRenderSuccess}
          canvasRef={canvasRef}
        />
      </div>
      {/* Mostramos la imagen extraída */}
      {imageData ? (
        <img src={imageData} alt={`Página ${pageNumber}`} className="w-full" />
      ) : (
        <p>Cargando página {pageNumber}...</p>
      )}
    </div>
  );
};

export default function StudiesPreview({ studies }: StudiesPreviewProps) {
  const [numPagesArray, setNumPagesArray] = useState<number[]>([]);

  // Cuando se carga un documento, se guarda el número de páginas para ese estudio en el índice correspondiente
  const onDocumentLoadSuccess = (pdf: any, index: number) => {
    setNumPagesArray((prev) => {
      const newArr = [...prev];
      newArr[index] = pdf.numPages;
      return newArr;
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Estudios Subidos</h3>
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
                      width={600}
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
