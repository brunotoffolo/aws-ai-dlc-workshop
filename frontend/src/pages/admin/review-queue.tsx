import { useReviewQueue, useReviewContent } from "@/hooks/api/use-content";
import { ReviewItem } from "@/components/admin/review-item";
import { queryClient } from "@/lib/query-client";

export default function ReviewQueuePage() {
  const { data, isLoading } = useReviewQueue();
  const review = useReviewContent();
  const items = (data?.data?.items ?? []) as Array<Record<string, unknown>>;

  const handleReview = (curriculumId: string, lessonId: string, action: string, feedback?: string) => {
    review.mutate({ curriculumId, lessonId, action, feedback }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["review-queue"] }),
    });
  };

  return (
    <div className="space-y-4 p-6" data-testid="admin-review-page">
      <h1 className="text-2xl font-bold">Content Review Queue</h1>
      {isLoading ? <p>Loading...</p> : items.length === 0 ? (
        <p className="text-muted-foreground">No items pending review.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ReviewItem key={`${item.curriculum_id}-${item.lesson_id}`} item={item} onReview={handleReview} />
          ))}
        </div>
      )}
    </div>
  );
}
