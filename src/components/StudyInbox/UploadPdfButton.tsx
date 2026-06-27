import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudyInboxMutations } from "@/hooks/StudyInbox/useStudyInboxMutations";

export const UploadPdfButton = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { ingest } = useStudyInboxMutations();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) ingest.mutate(file);
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        className="gap-2"
        disabled={ingest.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {ingest.isPending ? "Subiendo..." : "Subir PDF"}
      </Button>
    </>
  );
};
