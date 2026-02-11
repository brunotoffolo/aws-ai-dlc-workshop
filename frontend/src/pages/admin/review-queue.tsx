import { useReviewQueue, useReviewContent } from "@/hooks/api/use-content";
import { ReviewItem } from "@/components/admin/review-item";
import { queryClient } from "@/lib/query-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function ReviewQueuePage() {
  const { data, isLoading } = useReviewQueue();
  const review = useReviewContent();
  const allItems = (data?.data?.items ?? []) as Array<Record<string, unknown>>;
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>("all");

  const curricula = [...new Set(allItems.map((i) => i.curriculum_id as string))];
  const items = selectedCurriculum === "all" ? allItems : allItems.filter((i) => i.curriculum_id === selectedCurriculum);

  const handleReview = (curriculumId: string, lessonId: string, action: string, feedback?: string) => {
    review.mutate({ curriculumId, lessonId, action, feedback }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["review-queue"] }),
    });
  };

  return (
    <div className="space-y-4 p-6" data-testid="admin-review-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Review Queue ({items.length} items)</h1>
        <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
          <SelectTrigger className="w-64" data-testid="review-filter-select">
            <SelectValue placeholder="Filter by curriculum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All curricula ({allItems.length})</SelectItem>
            {curricula.map((c) => (
              <SelectItem key={c} value={c}>{c.slice(0, 12)}... ({allItems.filter((i) => i.curriculum_id === c).length})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? <p>Loading...</p> : items.length === 0 ? (
        <p className="text-muted-foreground">No items pending review.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <ReviewItem key={`${item.curriculum_id}-${item.lesson_order}-${idx}`} item={item} onReview={handleReview} />
          ))}
        </div>
      )}
    </div>
  );
}
