import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props { curriculumId: string; currentLessonId: string; lessons?: Array<{ id: string; title: string }> }

export function LessonNavigation({ curriculumId, currentLessonId, lessons }: Props) {
  if (!lessons || lessons.length === 0) return null;
  const idx = lessons.findIndex((l) => l.id === currentLessonId);
  const prev = idx > 0 ? lessons[idx - 1] : undefined;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : undefined;

  return (
    <div className="flex flex-wrap gap-2" data-testid="lesson-navigation">
      {prev ? (
        <Link to={`/curricula/${curriculumId}/lessons/${prev.id}`}>
          <Button variant="outline" size="sm" data-testid="lesson-nav-prev">
            <ChevronLeft className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">{prev.title}</span>
            <span className="sm:hidden">Previous</span>
          </Button>
        </Link>
      ) : (
        <Link to={`/curricula/${curriculumId}`}>
          <Button variant="outline" size="sm"><ChevronLeft className="mr-1 h-4 w-4" />Curriculum</Button>
        </Link>
      )}
      {next && (
        <Link to={`/curricula/${curriculumId}/lessons/${next.id}`}>
          <Button variant="outline" size="sm" data-testid="lesson-nav-next">
            <span className="hidden sm:inline">{next.title}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
