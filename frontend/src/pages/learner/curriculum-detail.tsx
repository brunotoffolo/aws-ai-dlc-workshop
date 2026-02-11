import { useParams, Link, useLocation } from "react-router-dom";
import { useCurriculum } from "@/hooks/api/use-curriculum";
import { GenerationStatus } from "@/components/curriculum/generation-status";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Clock, Loader2, AlertTriangle } from "lucide-react";

const statusIcon: Record<string, React.ReactNode> = {
  approved: <CheckCircle className="h-4 w-4 text-green-600" />,
  pending_review: <Clock className="h-4 w-4 text-yellow-600" />,
  generating: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
  failed: <AlertTriangle className="h-4 w-4 text-destructive" />,
};

export default function CurriculumDetailPage() {
  const { curriculumId = "" } = useParams();
  const location = useLocation();
  const generating = (location.state as { generating?: boolean })?.generating ?? false;
  const { data, isLoading } = useCurriculum(curriculumId);
  const curriculum = data?.data;

  if (isLoading) return <div className="p-6">Loading curriculum...</div>;
  if (!curriculum) return <div className="p-6">Curriculum not found</div>;

  const lessons = (curriculum.lessons ?? []) as Array<Record<string, unknown>>;
  const adaptivePath = curriculum.adaptive_path as Array<Record<string, unknown>> | undefined;
  const displayLessons = adaptivePath ?? lessons;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6" data-testid="curriculum-detail">
      <div>
        <h1 className="text-2xl font-bold">{(curriculum.title ?? curriculum.topic) as string}</h1>
        <p className="text-sm text-muted-foreground capitalize">Status: {curriculum.status as string}</p>
      </div>

      <GenerationStatus curriculumId={curriculumId} enabled={generating || curriculum.status === "RUNNING"} />

      {adaptivePath && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3" data-testid="adaptive-path-banner">
          <p className="text-sm font-medium text-primary">🎯 Personalised learning path — adapted based on your pre-assessment results</p>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          {adaptivePath ? "Your Learning Path" : "Lessons"}
          <span className="ml-2 text-sm font-normal text-muted-foreground">({displayLessons.length} lessons)</span>
        </h2>
        <div className="space-y-2">
          {displayLessons.map((lesson, idx) => {
            const id = lesson.lesson_id as string;
            const title = lesson.title as string;
            const status = (lesson.status ?? "approved") as string;
            const ready = status === "approved";
            const quizId = lesson.quiz_id as string | undefined;
            const skipped = lesson.skipped as boolean | undefined;

            return (
              <Card key={id} className={skipped ? "opacity-50" : ""} data-testid={`lesson-row-${id}`}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">{idx + 1}</span>
                    <div>
                      <p className="font-medium">{title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {statusIcon[status] ?? statusIcon["approved"]}
                        <span className="capitalize">{skipped ? "Skipped (already known)" : status.replace("_", " ")}</span>
                        {typeof lesson.difficulty === "string" && <span className="rounded bg-muted px-1.5 py-0.5">Difficulty: {lesson.difficulty}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {ready && (
                      <Link to={`/curricula/${curriculumId}/lessons/${id}`}>
                        <Button size="sm" variant="outline" data-testid={`lesson-open-${id}`}><BookOpen className="mr-1 h-3 w-3" />Open</Button>
                      </Link>
                    )}
                    {ready && quizId && (
                      <Link to={`/curricula/${curriculumId}/quiz/${quizId}`}>
                        <Button size="sm" variant="secondary" data-testid={`lesson-quiz-${id}`}>Quiz</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
