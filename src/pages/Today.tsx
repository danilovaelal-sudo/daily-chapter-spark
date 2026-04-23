import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, getAccessInfo } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface Lesson {
  id: string;
  day_number: number;
  title: string;
  goal: string | null;
  content: string | null;
}

export default function Today() {
  const { profile, user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [todayDone, setTodayDone] = useState(false);
  const access = getAccessInfo(profile?.start_date);

  useEffect(() => {
    if (!user || !access.hasAccess) return;
    (async () => {
      const [{ data: lessonData }, { data: progress }] = await Promise.all([
        supabase.from("lessons").select("*").eq("day_number", access.daysElapsed).maybeSingle(),
        supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id).eq("completed", true),
      ]);
      setLesson(lessonData);
      setCompletedCount(progress?.length ?? 0);
      if (lessonData) {
        setTodayDone(!!progress?.find((p) => p.lesson_id === lessonData.id));
      }
    })();
  }, [user, access.daysElapsed, access.hasAccess]);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 6 ? "Доброй ночи" : greetingHour < 12 ? "Доброе утро" : greetingHour < 18 ? "Добрый день" : "Добрый вечер";
  const name = profile?.full_name?.split(" ")[0] || "автор";

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-ink text-ink-foreground overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-amber/15 blur-3xl" />
        <div className="container relative py-12 md:py-20">
          <div className="flex items-center gap-2 eyebrow text-amber mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            {greeting}, {name}
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="text-amber font-mono text-sm tracking-widest mb-3">
                ДЕНЬ {String(access.daysElapsed).padStart(2, "0")} / 30
              </div>
              <h1 className="display-xl">
                {lesson?.title ?? "Сегодняшний урок готовится"}
              </h1>
              {lesson?.goal && (
                <p className="mt-6 text-lg md:text-xl text-ink-foreground/75 max-w-2xl">
                  {lesson.goal}
                </p>
              )}
            </div>
            <div className="lg:col-span-4">
              <div className="border-2 border-amber/40 rounded-2xl p-6 bg-ink/50 backdrop-blur">
                <div className="eyebrow text-amber mb-3">Ваш маршрут</div>
                <div className="flex items-end gap-2 mb-1">
                  <div className="font-display font-black text-6xl leading-none">{completedCount}</div>
                  <div className="text-ink-foreground/60 pb-2">из 30 дней</div>
                </div>
                <div className="h-2 bg-ink-foreground/10 rounded-full overflow-hidden mt-4">
                  <div
                    className="h-full bg-amber transition-all"
                    style={{ width: `${(completedCount / 30) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-ink-foreground/50 mt-3">
                  Осталось {access.daysRemaining} {access.daysRemaining === 1 ? "день" : "дней"} доступа
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {lesson && (
              <Button asChild variant="amber" size="xl">
                <Link to={`/lesson/${lesson.day_number}`}>
                  {todayDone ? "Открыть урок снова" : "Перейти к уроку"} <ArrowRight className="ml-1" />
                </Link>
              </Button>
            )}
            {todayDone && (
              <div className="flex items-center gap-2 text-amber font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Сегодняшний шаг сделан
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUICK NAV */}
      <section className="container py-12 md:py-20">
        <div className="eyebrow text-muted-foreground mb-3">Куда дальше</div>
        <h2 className="display-md mb-8">Сегодня — один маленький шаг.</h2>

        <div className="grid md:grid-cols-3 gap-5">
          <Link
            to="/program"
            className="group rounded-2xl bg-card border border-foreground/10 p-7 hover:border-amber transition-all hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="font-display font-black text-5xl text-foreground/15 mb-6">01</div>
            <h3 className="display-md text-2xl mb-2">Программа</h3>
            <p className="text-sm text-muted-foreground">Все 30 дней мастерской — посмотреть карту маршрута.</p>
          </Link>

          <Link
            to="/progress"
            className="group rounded-2xl bg-amber text-amber-foreground p-7 hover:-translate-y-1 transition-all hover:shadow-amber"
          >
            <div className="font-display font-black text-5xl text-amber-foreground/30 mb-6">02</div>
            <h3 className="display-md text-2xl mb-2">Прогресс</h3>
            <p className="text-sm text-amber-foreground/80">Сколько уже пройдено. Где вы сейчас на пути.</p>
          </Link>

          <Link
            to="/materials"
            className="group rounded-2xl bg-foreground text-background p-7 hover:-translate-y-1 transition-all hover:shadow-bold"
          >
            <div className="font-display font-black text-5xl text-background/20 mb-6">03</div>
            <h3 className="display-md text-2xl mb-2">Материалы</h3>
            <p className="text-sm text-background/70">Тетрадь, шаблоны, чек-листы — всё нужное под рукой.</p>
          </Link>
        </div>
      </section>

      {/* QUOTE */}
      <section className="border-y border-foreground/10 bg-cream-deep">
        <div className="container py-16 md:py-24 text-center">
          <div className="eyebrow text-muted-foreground mb-6">Из мастерской</div>
          <p className="display-md max-w-3xl mx-auto">
            «Книгу нельзя написать вчера. Её можно написать только сегодня — на одну страницу больше.»
          </p>
        </div>
      </section>
    </div>
  );
}
