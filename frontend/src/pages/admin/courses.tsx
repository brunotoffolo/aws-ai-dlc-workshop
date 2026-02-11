import { useCourseCatalog } from "@/hooks/api/use-admin";
import { AssignmentDialog } from "@/components/admin/assignment-dialog";
import { useUnassignCurriculum, useDeleteCurriculum } from "@/hooks/api/use-curriculum";
import { useApproveAllContent } from "@/hooks/api/use-content";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { queryClient } from "@/lib/query-client";

export default function CoursesPage() {
  const { data, isLoading } = useCourseCatalog();
  const courses = (data?.data?.courses ?? []) as Array<Record<string, unknown>>;
  const [assignId, setAssignId] = useState<string | null>(null);
  const [unassignId, setUnassignId] = useState<string | null>(null);
  const [unassignEmail, setUnassignEmail] = useState("");
  const unassign = useUnassignCurriculum();
  const deleteCurr = useDeleteCurriculum();
  const approveAll = useApproveAllContent();

  const handleUnassign = () => {
    if (!unassignId || !unassignEmail) return;
    unassign.mutate({ curriculumId: unassignId, learnerId: unassignEmail }, {
      onSuccess: () => { setUnassignId(null); setUnassignEmail(""); queryClient.invalidateQueries({ queryKey: ["admin"] }); },
    });
  };

  return (
    <div className="space-y-4 p-6" data-testid="admin-courses-page">
      <h1 className="text-2xl font-bold">Course Management</h1>
      {isLoading ? <p>Loading...</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.curriculum_id as string}>
              <CardHeader><CardTitle className="text-base">{(c.title ?? c.topic) as string}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{c.lesson_count as number ?? 0} lessons • {c.status as string}</p>
                <div className="flex gap-2 flex-wrap">
                  {(c.status as string) !== "approved" && (
                    <Button size="sm" variant="default" onClick={() => approveAll.mutate(c.curriculum_id as string, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }) })} data-testid={`approve-all-button-${c.curriculum_id}`}>Approve All</Button>
                  )}
                  <Button size="sm" onClick={() => setAssignId(c.curriculum_id as string)} data-testid={`assign-button-${c.curriculum_id}`}>Assign</Button>
                  <Button size="sm" variant="outline" onClick={() => setUnassignId(c.curriculum_id as string)} data-testid={`unassign-button-${c.curriculum_id}`}>Unassign</Button>
                  <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete this course and all its content?")) deleteCurr.mutate(c.curriculum_id as string); }} data-testid={`delete-button-${c.curriculum_id}`}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {assignId && <AssignmentDialog curriculumId={assignId} onClose={() => setAssignId(null)} />}
      {unassignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setUnassignId(null)}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Unassign Curriculum</h2>
            <Input placeholder="Learner email or ID" value={unassignEmail} onChange={(e) => setUnassignEmail(e.target.value)} data-testid="unassign-email-input" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setUnassignId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleUnassign} disabled={unassign.isPending || !unassignEmail} data-testid="unassign-submit-button">
                {unassign.isPending ? "Unassigning..." : "Unassign"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
