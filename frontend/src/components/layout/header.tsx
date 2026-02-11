import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b px-6" data-testid="app-header">
      <span className="text-sm text-muted-foreground">{user?.email}</span>
      <div className="flex items-center gap-2">
        <Link to="/profile"><Button variant="ghost" size="icon" data-testid="header-profile-button"><User className="h-4 w-4" /></Button></Link>
        <Button variant="ghost" size="icon" onClick={logout} data-testid="header-logout-button"><LogOut className="h-4 w-4" /></Button>
      </div>
    </header>
  );
}
