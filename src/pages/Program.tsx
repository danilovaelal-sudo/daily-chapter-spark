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
    <div>
      <div className="bg-ink text-ink-foreground border-b-2 border-foreground">
        <div className="container py-12 md:py-20">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="eyebrow text-amber mb-4">Программа курса</div>
              <h1 className="display-xl">30 дней.<br/><span className="text-amber">Один маршрут.</span></h1>
            </div>
            <div className="lg:col-span-4">
              <p className="text-lg text-ink-foreground/80 font-display font-medium leading-snug">
                Каждый день — один шаг. Открывайте уроки по мере их появления или возвращайтесь к пройденным.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-14 md:py-20 space-y-20">
        {weeks.map((w, idx) => {
          const items = lessons.filter((l) => l.day_number >= w.range[0] && l.day_number <= w.range[1]);
          const tones = ["text-foreground", "text-amber", "text-hot", "text-electric"];
          return (
            <section key={w.num}>
              <div className="flex items-end justify-between mb-8 pb-4 border-b-2 border-foreground">
                <div className="flex items-end gap-5">
                  <div className={cn("font-display font-black text-7xl md:text-8xl leading-[0.85]", tones[idx])}>0{w.num}</div>
                  <div className="pb-2">
                    <div className="eyebrow text-muted-foreground">Неделя {w.num}</div>
                    <div className="font-display font-black text-3xl">{w.title}</div>
                  </div>
                </div>
                <div className="font-mono text-xs text-muted-foreground tracking-[0.25em] pb-3">
                  ДНИ {w.range[0]}–{w.range[1]}
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
                        "relative h-full rounded-3xl p-6 border-2 transition-all overflow-hidden",
                        isToday && "border-amber bg-amber text-amber-foreground shadow-amber",
                        isDone && !isToday && "border-foreground bg-foreground text-background",
                        !isDone && !isToday && !isLocked && "border-foreground bg-card hover:bg-foreground hover:text-background hover:-translate-y-1 hover:shadow-bold",
                        isLocked && "border-foreground/15 bg-muted/40 opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="font-display font-black text-5xl leading-none">
                          {String(l.day_number).padStart(2, "0")}
                        </div>
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : isToday ? (
                          <span className="text-[10px] uppercase tracking-widest font-black bg-amber-foreground text-amber px-2.5 py-1 rounded-full">
                            Сегодня
                          </span>
                        ) : (
                          <Circle className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                      <h3 className="font-display font-bold text-xl leading-tight mb-1">{l.title}</h3>
                      {l.goal && <p className={cn("text-sm mt-2 line-clamp-2 opacity-75")}>{l.goal}</p>}
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
