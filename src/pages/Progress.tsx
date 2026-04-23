import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, getAccessInfo } from "@/hooks/useAuth";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Progress() {
  const { user, profile } = useAuth();
  const access = getAccessInfo(profile?.start_date);
  const [completed, setCompleted] = useState<number[]>([]); // day numbers

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("completed, lessons!inner(day_number)")
        .eq("user_id", user.id)
        .eq("completed", true);
      setCompleted(((data as any) ?? []).map((d: any) => d.lessons.day_number));
    })();
  }, [user]);

  const total = 30;
  const pct = Math.round((completed.length / total) * 100);
  const weeks = [
    { num: 1, range: [1, 7] },
    { num: 2, range: [8, 14] },
    { num: 3, range: [15, 21] },
    { num: 4, range: [22, 30] },
  ];

  return (
    <div className="container py-10 md:py-16">
      <div className="eyebrow text-amber mb-3">Ваш прогресс</div>
      <h1 className="display-lg mb-10">Где вы сейчас.</h1>

      <div className="grid md:grid-cols-3 gap-5 mb-12">
        <div className="rounded-2xl bg-ink text-ink-foreground p-7">
          <div className="eyebrow text-amber mb-4">Завершено</div>
          <div className="font-display font-black text-7xl leading-none">{completed.length}</div>
          <div className="text-ink-foreground/60 mt-2">из 30 дней</div>
        </div>
        <div className="rounded-2xl bg-amber text-amber-foreground p-7">
          <div className="eyebrow mb-4">Сегодня</div>
          <div className="font-display font-black text-7xl leading-none">{access.daysElapsed}</div>
          <div className="text-amber-foreground/70 mt-2">день курса</div>
        </div>
        <div className="rounded-2xl bg-card border-2 border-foreground/10 p-7">
          <div className="eyebrow text-muted-foreground mb-4">Осталось</div>
          <div className="font-display font-black text-7xl leading-none">{access.daysRemaining}</div>
          <div className="text-muted-foreground mt-2">дней доступа</div>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-3">
          <div className="eyebrow text-muted-foreground">Общий прогресс</div>
          <div className="font-display font-bold text-3xl">{pct}%</div>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-amber transition-all" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section>
        <div className="eyebrow text-muted-foreground mb-6">По неделям</div>
        <div className="space-y-6">
          {weeks.map((w) => {
            const days = Array.from({ length: w.range[1] - w.range[0] + 1 }, (_, i) => w.range[0] + i);
            const wDone = days.filter((d) => completed.includes(d)).length;
            return (
              <div key={w.num} className="border-b border-foreground/10 pb-6">
                <div className="flex items-baseline justify-between mb-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display font-black text-3xl">0{w.num}</span>
                    <span className="text-muted-foreground">Неделя {w.num}</span>
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">
                    {wDone}/{days.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {days.map((d) => {
                    const isDone = completed.includes(d);
                    const isToday = d === access.daysElapsed;
                    return (
                      <div
                        key={d}
                        className={cn(
                          "h-10 w-10 rounded-md flex items-center justify-center text-xs font-bold border-2",
                          isDone && "bg-foreground text-background border-foreground",
                          !isDone && isToday && "border-amber bg-amber/10 text-foreground",
                          !isDone && !isToday && d <= access.daysElapsed && "border-foreground/20 text-foreground",
                          d > access.daysElapsed && "border-foreground/10 text-muted-foreground/50"
                        )}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : d}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
