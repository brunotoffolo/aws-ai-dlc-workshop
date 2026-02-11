import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface Props { curriculum: Record<string, unknown> }

export function CurriculumCard({ curriculum }: Props) {
  const id = curriculum.curriculum_id as string;
  const title = (curriculum.title ?? curriculum.topic ?? "Untitled") as string;
  const progress = (curriculum.progress ?? 0) as number;
  const status = (curriculum.status ?? "") as string;
  const assigned = !!curriculum.assigned;

  return (
    <Link to={`/curricula/${id}`} data-testid={`curriculum-card-${id}`} className="flex">
      <Card className="flex flex-1 flex-col transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          {assigned && <span className="w-fit rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Assigned</span>}
          <CardDescription className="capitalize">{status}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <div className="h-2 w-full rounded-full bg-secondary">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{progress}% complete</p>
        </CardContent>
      </Card>
    </Link>
  );
}
