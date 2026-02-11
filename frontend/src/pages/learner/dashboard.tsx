import { Link } from "react-router-dom";
import { useDashboard } from "@/hooks/api/use-progress";
import { CurriculumCard } from "@/components/learner/curriculum-card";
import { ProgressChart } from "@/components/learner/progress-chart";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const dashboard = data?.data;

  if (isLoading) return <div className="p-6">Loading dashboard...</div>;

  const active = (dashboard?.active_curricula ?? dashboard?.active ?? []) as Array<Record<string, unknown>>;
  const completed = (dashboard?.completed_curricula ?? dashboard?.completed ?? []) as Array<Record<string, unknown>>;
  const assigned = (dashboard?.assigned ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6 p-6" data-testid="learner-dashboard">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Learning</h1>
        <Link to="/curricula/create">
          <Button data-testid="dashboard-create-button"><Plus className="mr-2 h-4 w-4" />New Curriculum</Button>
        </Link>
      </div>

      {dashboard?.overall_progress != null && (
        <ProgressChart progress={dashboard.overall_progress as number} label="Overall Progress" />
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Active Curricula</h2>
        {active.length === 0 ? (
          <p className="text-muted-foreground">No active curricula. Create one to get started!</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((c) => <CurriculumCard key={c.curriculum_id as string} curriculum={c} />)}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Completed</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((c) => <CurriculumCard key={c.curriculum_id as string} curriculum={c} />)}
          </div>
        </section>
      )}

      {assigned.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Assigned to You</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assigned.map((c) => <CurriculumCard key={c.curriculum_id as string} curriculum={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
