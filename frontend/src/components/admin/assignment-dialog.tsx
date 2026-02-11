import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAssignCurriculum } from "@/hooks/api/use-curriculum";
import { useState } from "react";

interface Props { curriculumId: string; onClose: () => void }

export function AssignmentDialog({ curriculumId, onClose }: Props) {
  const assign = useAssignCurriculum();
  const [learnerIds, setLearnerIds] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleAssign = () => {
    const ids = learnerIds.split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) return;
    assign.mutate({ curriculum_id: curriculumId, learner_ids: ids, deadline: deadline || undefined }, {
      onSuccess: onClose,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Assign Curriculum</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Learner IDs (comma-separated)</Label>
            <Input value={learnerIds} onChange={(e) => setLearnerIds(e.target.value)} placeholder="user1, user2" data-testid="assign-learner-ids-input" />
          </div>
          <div className="space-y-2">
            <Label>Deadline (optional)</Label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} data-testid="assign-deadline-input" />
          </div>
          <Button onClick={handleAssign} className="w-full" disabled={assign.isPending} data-testid="assign-submit-button">
            {assign.isPending ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
