import { Link, NavLink, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth, getAccessInfo } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BookOpen, LayoutGrid, BarChart3, Folder, LifeBuoy, Shield, LogOut, Menu, X, UserCog } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Сегодня", icon: BookOpen },
  { to: "/program", label: "Программа", icon: LayoutGrid },
  { to: "/progress", label: "Прогресс", icon: BarChart3 },
  { to: "/materials", label: "Материалы", icon: Folder },
  { to: "/support", label: "Поддержка", icon: LifeBuoy },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { signOut, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const access = profile ? getAccessInfo(profile.start_date) : null;
  const showProgress = !isAdmin && access?.hasStarted && access.hasAccess;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-ink flex items-center justify-center">
              <span className="font-display font-black text-amber text-lg leading-none">М</span>
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-base">Мастерская</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">книги</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-colors",
                    isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1",
                    isActive ? "bg-amber text-amber-foreground" : "text-amber hover:bg-amber/10"
                  )
                }
              >
                <Shield className="h-3.5 w-3.5" /> Админ
              </NavLink>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {profile?.full_name && (
              <span className="text-sm text-muted-foreground hidden lg:inline">{profile.full_name}</span>
            )}
            <NavLink to="/account" className={({ isActive }) => cn("p-2 rounded-full transition-colors", isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")} aria-label="Личный кабинет">
              <UserCog className="h-4 w-4" />
            </NavLink>
            <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Выйти">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="Меню"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-foreground/10 bg-background animate-fade-up">
            <nav className="container py-3 flex flex-col gap-1">
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium",
                        isActive ? "bg-foreground text-background" : "hover:bg-foreground/5"
                      )
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {l.label}
                  </NavLink>
                );
              })}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium",
                      isActive ? "bg-amber text-amber-foreground" : "text-amber hover:bg-amber/10"
                    )
                  }
                >
                  <Shield className="h-5 w-5" />
                  Админ-панель
                </NavLink>
              )}
              <NavLink
                to="/account"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium",
                    isActive ? "bg-foreground text-background" : "hover:bg-foreground/5"
                  )
                }
              >
                <UserCog className="h-5 w-5" />
                Личный кабинет
              </NavLink>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:bg-foreground/5 text-left"
              >
                <LogOut className="h-5 w-5" />
                Выйти
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-foreground/10 mt-16">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© Мастерская книги · 30 дней творческой работы</div>
          <div>Сделано с любовью к слову</div>
        </div>
      </footer>
    </div>
  );
}
