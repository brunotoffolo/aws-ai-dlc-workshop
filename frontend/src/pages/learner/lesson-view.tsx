import { useParams } from "react-router-dom";
import { useLesson } from "@/hooks/api/use-content";
import { useCompleteLesson } from "@/hooks/api/use-progress";
import { MarkdownRenderer } from "@/components/content/markdown-renderer";
import { LessonNavigation } from "@/components/content/lesson-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BookOpen, Clock } from "lucide-react";

export default function LessonViewPage() {
  const { curriculumId = "", lessonId = "" } = useParams();
  const { data, isLoading } = useLesson(curriculumId, lessonId);
  const complete = useCompleteLesson();
  const lesson = data?.data;

  if (isLoading) return <div className="flex h-64 items-center justify-center text-muted-foreground">Loading lesson...</div>;
  if (!lesson) return <div className="flex h-64 items-center justify-center text-muted-foreground">Lesson not found</div>;

  const siblings = lesson.siblings as Array<{ id: string; title: string }> | undefined;
  const currentIdx = siblings?.findIndex((s) => s.id === lessonId) ?? -1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8" data-testid="lesson-view">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <BookOpen className="h-4 w-4" />
          {siblings && currentIdx >= 0 && <span>Lesson {currentIdx + 1} of {siblings.length}</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{lesson.title as string}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />~10 min read</span>
          {lesson.completed && <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3.5 w-3.5" />Completed</span>}
        </div>
      </div>

      {/* Learning Objectives */}
      {lesson.objectives && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4 sm:p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
              🎯 Learning Objectives
            </h2>
            <ul className="space-y-2">
              {(lesson.objectives as string[]).map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{i + 1}</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <div className="mb-8">
        <MarkdownRenderer content={lesson.content as string} />
      </div>

      {/* Footer Actions */}
      <div className="border-t pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <LessonNavigation curriculumId={curriculumId} currentLessonId={lessonId} lessons={siblings} />
          <Button
            size="lg"
            onClick={() => complete.mutate({ curriculumId, lessonId })}
            disabled={complete.isPending || !!lesson.completed}
            className={lesson.completed ? "bg-green-600 hover:bg-green-600" : ""}
            data-testid="lesson-complete-button"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {lesson.completed ? "Completed ✓" : complete.isPending ? "Saving..." : "Mark as Complete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
