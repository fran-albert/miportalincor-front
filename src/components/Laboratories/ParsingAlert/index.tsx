import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ParsingResult } from "@/types/Study/Study";
import { AlertTriangle, X } from "lucide-react";
import { formatDate } from "@/common/helpers/helpers";

interface StudyParsingInfo {
  studyId: string;
  date: string;
  parsingResult: ParsingResult;
}

interface ParsingAlertProps {
  parsingInfos: StudyParsingInfo[];
  onDismiss: (studyId: string) => void;
  isLoading?: boolean;
}

export const ParsingAlert = ({
  parsingInfos,
  onDismiss,
  isLoading,
}: ParsingAlertProps) => {
  // Filter to only show studies with parsing issues that haven't been dismissed
  const issuesNotDismissed = parsingInfos.filter(
    (info) => !info.parsingResult.success && !info.parsingResult.dismissedAt
  );

  if (issuesNotDismissed.length === 0) return null;

  return (
    <Alert className="mb-4 border-amber-500 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">
        Problemas de parsing detectados
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        <div className="mt-2 space-y-2">
          {issuesNotDismissed.map((info) => (
            <div
              key={info.studyId}
              className="flex items-center justify-between rounded-md bg-amber-100 p-2"
            >
              <div className="flex-1">
                <span className="font-medium">
                  Laboratorio del {formatDate(info.date)}:
                </span>
                {info.parsingResult.errors &&
                  info.parsingResult.errors.length > 0 && (
                    <ul className="ml-4 mt-1 list-disc text-sm">
                      {info.parsingResult.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  )}
                {info.parsingResult.warnings &&
                  info.parsingResult.warnings.length > 0 && (
                    <ul className="ml-4 mt-1 list-disc text-sm text-amber-600">
                      {info.parsingResult.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  )}
                <p className="mt-1 text-sm">
                  Valores extraidos: {info.parsingResult.valuesCount}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 text-amber-700 hover:bg-amber-200 hover:text-amber-900"
                onClick={() => onDismiss(info.studyId)}
                disabled={isLoading}
              >
                <X className="mr-1 h-4 w-4" />
                Entendido
              </Button>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};
