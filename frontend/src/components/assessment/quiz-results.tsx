import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props { results: Record<string, unknown>; curriculumId?: string }

export function QuizResults({ results, curriculumId }: Props) {
  const navigate = useNavigate();
  const score = results.score as number;
  const total = results.total as number;
  const passed = results.passed as boolean;
  const feedback = (results.feedback ?? []) as Array<Record<string, unknown>>;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6" data-testid="quiz-results">
      <Card className={passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-destructive" />}
            {passed ? "🎉 Congratulations, you passed!" : "Not passed — review the feedback below"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-current text-lg font-bold" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
              {pct}%
            </div>
            <div>
              <p className="text-lg font-medium">{score} of {total} correct</p>
              <p className="text-sm text-muted-foreground">{passed ? "You met the passing threshold" : "Review the material and try again"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold">Question Review</h2>
      {feedback.map((f, i) => (
        <Card key={i} className={f.correct ? "border-green-100" : "border-red-100"}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center gap-2">
              {f.correct ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-destructive" />}
              <p className="font-medium">Q{i + 1}: {f.question as string}</p>
            </div>
            <p className="text-sm">Your answer: <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{f.user_answer as string}</span></p>
            {!f.correct && (
              <p className="text-sm text-destructive">✗ Correct answer: <span className="font-medium">{f.correct_answer as string}</span></p>
            )}
            {typeof f.explanation === "string" && (
              <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                💡 {f.explanation}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-3 pt-2">
        {curriculumId && (
          <Button variant="outline" onClick={() => navigate(`/curricula/${curriculumId}`)} data-testid="quiz-results-back-button">
            ← Back to Curriculum
          </Button>
        )}
        {!passed && (
          <Button onClick={() => window.location.reload()} data-testid="quiz-results-retry-button">
            Retry Quiz
          </Button>
        )}
      </div>
    </div>
  );
}
