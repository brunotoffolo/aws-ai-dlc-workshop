import { useCourseCatalog } from "@/hooks/api/use-admin";
import { AssignmentDialog } from "@/components/admin/assignment-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CoursesPage() {
  const { data, isLoading } = useCourseCatalog();
  const courses = (data?.data?.courses ?? []) as Array<Record<string, unknown>>;
  const [assignId, setAssignId] = useState<string | null>(null);

  return (
    <div className="space-y-4 p-6" data-testid="admin-courses-page">
      <h1 className="text-2xl font-bold">Course Management</h1>
      {isLoading ? <p>Loading...</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.curriculum_id as string}>
              <CardHeader><CardTitle className="text-base">{(c.title ?? c.topic) as string}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{c.lesson_count as number ?? 0} lessons</p>
                <Button size="sm" onClick={() => setAssignId(c.curriculum_id as string)} data-testid={`assign-button-${c.curriculum_id}`}>Assign</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {assignId && <AssignmentDialog curriculumId={assignId} onClose={() => setAssignId(null)} />}
    </div>
  );
}
