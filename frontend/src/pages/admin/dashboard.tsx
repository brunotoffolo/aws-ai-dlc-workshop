import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useReviewBacklog } from "@/hooks/api/use-admin";
import { Users, BookOpen, FileCheck } from "lucide-react";

export default function AdminDashboardPage() {
  const { data } = useReviewBacklog();
  const backlog = data?.data;

  return (
    <div className="space-y-6 p-6" data-testid="admin-dashboard">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/admin/learners">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Users className="h-5 w-5 text-primary" /><CardTitle className="text-base">Learners</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">View learner progress</p></CardContent>
          </Card>
        </Link>
        <Link to="/admin/courses">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <BookOpen className="h-5 w-5 text-primary" /><CardTitle className="text-base">Courses</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Manage & assign curricula</p></CardContent>
          </Card>
        </Link>
        <Link to="/admin/review">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <FileCheck className="h-5 w-5 text-primary" /><CardTitle className="text-base">Review Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{backlog?.pending_count ?? 0} items pending review</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
