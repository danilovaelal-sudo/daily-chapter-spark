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
    <div>
      <div className="bg-ink text-ink-foreground border-b-2 border-foreground">
        <div className="container py-12 md:py-20">
          <div className="eyebrow text-amber mb-4">Ваш прогресс</div>
          <h1 className="display-xl">Где вы<br/><span className="text-amber">сейчас.</span></h1>
        </div>
      </div>

      <div className="container py-14 md:py-20">
        <div className="grid md:grid-cols-3 gap-5 mb-16 -mt-24 md:-mt-28 relative z-10">
          <div className="rounded-3xl bg-foreground text-background p-8 border-2 border-foreground shadow-bold">
            <div className="eyebrow text-amber mb-5">Завершено</div>
            <div className="font-display font-black text-8xl leading-[0.85]">{completed.length}</div>
            <div className="text-background/60 mt-3 font-mono text-xs uppercase tracking-widest">из 30 дней</div>
          </div>
          <div className="rounded-3xl bg-amber text-amber-foreground p-8 border-2 border-foreground shadow-amber">
            <div className="eyebrow mb-5">Сегодня</div>
            <div className="font-display font-black text-8xl leading-[0.85]">{access.daysElapsed}</div>
            <div className="text-amber-foreground/70 mt-3 font-mono text-xs uppercase tracking-widest">день курса</div>
          </div>
          <div className="rounded-3xl bg-hot text-hot-foreground p-8 border-2 border-foreground shadow-hot">
            <div className="eyebrow mb-5">Осталось</div>
            <div className="font-display font-black text-8xl leading-[0.85]">{access.daysRemaining}</div>
            <div className="text-hot-foreground/75 mt-3 font-mono text-xs uppercase tracking-widest">дней доступа</div>
          </div>
        </div>

        <section className="mb-16 border-2 border-foreground rounded-3xl p-8 bg-card">
          <div className="flex items-baseline justify-between mb-4">
            <div className="eyebrow text-muted-foreground">Общий прогресс</div>
            <div className="font-display font-black text-5xl">{pct}%</div>
          </div>
          <div className="h-5 bg-muted rounded-full overflow-hidden border-2 border-foreground">
            <div className="h-full bg-gradient-amber transition-all" style={{ width: `${pct}%` }} />
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-foreground">
            <h2 className="display-md">По неделям</h2>
            <div className="font-mono text-xs tracking-[0.25em] uppercase text-muted-foreground">04 недели</div>
          </div>
          <div className="space-y-8">
            {weeks.map((w, idx) => {
              const tones = ["text-foreground", "text-amber", "text-hot", "text-electric"];
              const days = Array.from({ length: w.range[1] - w.range[0] + 1 }, (_, i) => w.range[0] + i);
              const wDone = days.filter((d) => completed.includes(d)).length;
              return (
                <div key={w.num} className="border-b border-foreground/15 pb-6">
                  <div className="flex items-baseline justify-between mb-4">
                    <div className="flex items-baseline gap-4">
                      <span className={cn("font-display font-black text-5xl leading-none", tones[idx])}>0{w.num}</span>
                      <span className="text-muted-foreground uppercase tracking-widest text-xs">Неделя {w.num}</span>
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
                            "h-11 w-11 rounded-lg flex items-center justify-center text-xs font-black border-2 transition-all",
                            isDone && "bg-foreground text-background border-foreground",
                            !isDone && isToday && "border-amber bg-amber text-amber-foreground shadow-amber",
                            !isDone && !isToday && d <= access.daysElapsed && "border-foreground/30 text-foreground hover:border-foreground",
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
    </div>
  );
}
