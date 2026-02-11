import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Props {
  item: Record<string, unknown>;
  onReview: (curriculumId: string, lessonId: string, action: string, feedback?: string) => void;
}

export function ReviewItem({ item, onReview }: Props) {
  const [feedback, setFeedback] = useState("");
  const curriculumId = item.curriculum_id as string;
  const lessonId = item.lesson_id as string;

  return (
    <Card data-testid={`review-item-${lessonId}`}>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="font-medium">{item.title as string}</p>
          <p className="text-sm text-muted-foreground">Curriculum: {curriculumId} • Lesson: {lessonId}</p>
        </div>
        <Textarea placeholder="Feedback (optional)" value={feedback} onChange={(e) => setFeedback(e.target.value)} data-testid="review-feedback-input" />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onReview(curriculumId, lessonId, "approve", feedback)} data-testid="review-approve-button">Approve</Button>
          <Button size="sm" variant="destructive" onClick={() => onReview(curriculumId, lessonId, "reject", feedback)} data-testid="review-reject-button">Reject</Button>
        </div>
      </CardContent>
    </Card>
  );
}
