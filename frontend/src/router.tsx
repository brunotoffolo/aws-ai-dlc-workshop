import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { RoleGuard } from "@/components/auth/role-guard";
import { lazy, Suspense } from "react";

const Login = lazy(() => import("@/pages/auth/login"));
const Register = lazy(() => import("@/pages/auth/register"));
const VerifyEmail = lazy(() => import("@/pages/auth/verify-email"));
const Profile = lazy(() => import("@/pages/auth/profile"));
const Dashboard = lazy(() => import("@/pages/learner/dashboard"));
const CurriculumCreate = lazy(() => import("@/pages/learner/curriculum-create"));
const CurriculumDetail = lazy(() => import("@/pages/learner/curriculum-detail"));
const LessonView = lazy(() => import("@/pages/learner/lesson-view"));
const Quiz = lazy(() => import("@/pages/learner/quiz"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const Learners = lazy(() => import("@/pages/admin/learners"));
const Courses = lazy(() => import("@/pages/admin/courses"));
const ReviewQueue = lazy(() => import("@/pages/admin/review-queue"));

function Loader() {
  return <div className="flex h-full items-center justify-center">Loading...</div>;
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  { path: "/login", element: <S><Login /></S> },
  { path: "/register", element: <S><Register /></S> },
  { path: "/verify-email", element: <S><VerifyEmail /></S> },
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <S><Dashboard /></S> },
      { path: "profile", element: <S><Profile /></S> },
      { path: "curricula/create", element: <S><CurriculumCreate /></S> },
      { path: "curricula/:curriculumId", element: <S><CurriculumDetail /></S> },
      { path: "curricula/:curriculumId/lessons/:lessonId", element: <S><LessonView /></S> },
      { path: "curricula/:curriculumId/quiz/:quizId", element: <S><Quiz /></S> },
      {
        path: "admin",
        element: <RoleGuard role="admin"><S><AdminDashboard /></S></RoleGuard>,
      },
      { path: "admin/learners", element: <RoleGuard role="admin"><S><Learners /></S></RoleGuard> },
      { path: "admin/courses", element: <RoleGuard role="admin"><S><Courses /></S></RoleGuard> },
      { path: "admin/review", element: <RoleGuard role="admin"><S><ReviewQueue /></S></RoleGuard> },
    ],
  },
]);
