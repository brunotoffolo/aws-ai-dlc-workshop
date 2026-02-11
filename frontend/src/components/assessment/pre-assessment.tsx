import { useParams, useNavigate } from "react-router-dom";
import { usePreAssessment, useSubmitPreAssessment } from "@/hooks/api/use-assessment";
import { QuestionRenderer } from "@/components/assessment/question-renderer";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PreAssessment() {
  const { curriculumId = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = usePreAssessment(curriculumId);
  const submit = useSubmitPreAssessment();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);

  const questions = (data?.data?.questions ?? []) as Array<Record<string, unknown>>;
  const current = questions[idx];

  if (isLoading) return <div className="p-6">Loading pre-assessment...</div>;
  if (!questions.length) return null;

  const handleSubmit = () => {
    const payload = Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer }));
    submit.mutate({ curriculumId, answers: payload }, {
      onSuccess: () => navigate(`/curricula/${curriculumId}`),
    });
  };

  return (
    <div className="mx-auto max-w-2xl p-6" data-testid="pre-assessment">
      <h1 className="mb-1 text-2xl font-bold">Knowledge Pre-Assessment</h1>
      <p className="mb-6 text-sm text-muted-foreground">Question {idx + 1} of {questions.length}</p>
      {current && (
        <QuestionRenderer
          question={current}
          answer={answers[current.question_id as string] ?? ""}
          onAnswer={(a) => setAnswers((p) => ({ ...p, [current.question_id as string]: a }))}
        />
      )}
      <div className="mt-6 flex justify-between">
        <Button variant="outline" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)} data-testid="preassess-prev-button">Previous</Button>
        {idx < questions.length - 1 ? (
          <Button onClick={() => setIdx((i) => i + 1)} data-testid="preassess-next-button">Next</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submit.isPending} data-testid="preassess-submit-button">
            {submit.isPending ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
}
