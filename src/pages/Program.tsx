import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, getAccessInfo } from "@/hooks/useAuth";
import { CheckCircle2, Lock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  day_number: number;
  title: string;
  goal: string | null;
}

export default function Program() {
  const { user, profile } = useAuth();
  const access = getAccessInfo(profile?.start_date);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: ls }, { data: prog }] = await Promise.all([
        supabase.from("lessons").select("id, day_number, title, goal").order("day_number"),
        supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id).eq("completed", true),
      ]);
      setLessons(ls ?? []);
      setCompleted(new Set((prog ?? []).map((p) => p.lesson_id)));
    })();
  }, [user]);

  const weeks = [
    { num: 1, range: [1, 7], title: "Старт" },
    { num: 2, range: [8, 14], title: "Замысел" },
    { num: 3, range: [15, 21], title: "Структура" },
    { num: 4, range: [22, 30], title: "Текст" },
  ];

  return (
    <div className="container py-10 md:py-16">
      <div className="max-w-3xl">
        <div className="eyebrow text-amber mb-3">Программа курса</div>
        <h1 className="display-lg mb-5">30 дней. Один маршрут.</h1>
        <p className="text-lg text-muted-foreground">
          Каждый день — один шаг. Открывайте уроки по мере того, как они становятся доступны, или возвращайтесь к уже пройденным.
        </p>
      </div>

      <div className="mt-12 space-y-14">
        {weeks.map((w) => {
          const items = lessons.filter((l) => l.day_number >= w.range[0] && l.day_number <= w.range[1]);
          return (
            <section key={w.num}>
              <div className="flex items-baseline justify-between mb-6 pb-3 border-b-2 border-foreground/15">
                <div className="flex items-baseline gap-4">
                  <div className="font-display font-black text-5xl md:text-6xl">0{w.num}</div>
                  <div>
                    <div className="eyebrow text-muted-foreground">Неделя {w.num}</div>
                    <div className="font-display font-bold text-2xl">{w.title}</div>
                  </div>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {w.range[0]}–{w.range[1]}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((l) => {
                  const isDone = completed.has(l.id);
                  const isLocked = l.day_number > access.daysElapsed;
                  const isToday = l.day_number === access.daysElapsed;

                  const card = (
                    <div
                      className={cn(
                        "relative h-full rounded-2xl p-6 border-2 transition-all",
                        isToday && "border-amber bg-amber/10 shadow-amber",
                        isDone && !isToday && "border-foreground bg-foreground text-background",
                        !isDone && !isToday && !isLocked && "border-foreground/15 bg-card hover:border-foreground hover:-translate-y-0.5",
                        isLocked && "border-foreground/10 bg-muted/40 opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="font-display font-black text-4xl leading-none">
                          {String(l.day_number).padStart(2, "0")}
                        </div>
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : isToday ? (
                          <span className="text-[10px] uppercase tracking-widest font-bold bg-amber-foreground text-amber px-2 py-1 rounded-full">
                            Сегодня
                          </span>
                        ) : (
                          <Circle className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                      <h3 className="font-display font-bold text-lg leading-tight mb-1">{l.title}</h3>
                      {l.goal && <p className={cn("text-sm mt-2 line-clamp-2", isDone ? "text-background/70" : "text-muted-foreground")}>{l.goal}</p>}
                    </div>
                  );

                  if (isLocked) {
                    return <div key={l.id}>{card}</div>;
                  }
                  return (
                    <Link key={l.id} to={`/lesson/${l.day_number}`} className="block">
                      {card}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
