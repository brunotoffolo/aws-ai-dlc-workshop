import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, Users, FileCheck, GraduationCap } from "lucide-react";

const learnerLinks = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/curricula/create", icon: BookOpen, label: "New Curriculum" },
];

const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Admin Home" },
  { to: "/admin/learners", icon: Users, label: "Learners" },
  { to: "/admin/courses", icon: GraduationCap, label: "Courses" },
  { to: "/admin/review", icon: FileCheck, label: "Review Queue" },
];

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const links = isAdmin ? [...learnerLinks, ...adminLinks] : learnerLinks;

  return (
    <aside className="flex w-56 flex-col border-r bg-muted/30" data-testid="app-sidebar">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-bold text-primary">TutorialAI</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/" || link.to === "/admin"}
            className={({ isActive }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
            data-testid={`sidebar-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
          >
            <link.icon className="h-4 w-4" />{link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
