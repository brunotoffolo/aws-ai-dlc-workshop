import { useLearnerOverview } from "@/hooks/api/use-admin";
import { LearnerTable } from "@/components/admin/learner-table";

export default function LearnersPage() {
  const { data, isLoading } = useLearnerOverview();
  const learners = (data?.data?.learners ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4 p-6" data-testid="admin-learners-page">
      <h1 className="text-2xl font-bold">Learner Overview</h1>
      {isLoading ? <p>Loading...</p> : <LearnerTable learners={learners} />}
    </div>
  );
}
