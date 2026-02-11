import { useCurriculumStatus } from "@/hooks/api/use-curriculum";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface Props { curriculumId: string; enabled: boolean }

export function GenerationStatus({ curriculumId, enabled }: Props) {
  const { data } = useCurriculumStatus(curriculumId, enabled);
  const status = data?.data?.status as string | undefined;

  if (!enabled || !status) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border p-4" data-testid="generation-status">
      {status === "RUNNING" && <><Loader2 className="h-5 w-5 animate-spin text-primary" /><span>Generating curriculum...</span></>}
      {status === "SUCCEEDED" && <><CheckCircle className="h-5 w-5 text-green-600" /><span>Curriculum ready!</span></>}
      {status === "FAILED" && <><XCircle className="h-5 w-5 text-destructive" /><span>Generation failed. Please try again.</span></>}
    </div>
  );
}
