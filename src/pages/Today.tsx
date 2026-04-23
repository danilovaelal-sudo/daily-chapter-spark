import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, getAccessInfo } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, CheckCircle2, Sparkles } from "lucide-react";

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

  if (!access.hasStarted && access.startDate) {
    return (
      <section className="min-h-[calc(100vh-5rem)] bg-ink text-ink-foreground flex items-center">
        <div className="container py-16 md:py-24">
          <div className="max-w-4xl">
            <div className="eyebrow text-amber mb-6">Мастерская ждёт старта</div>
            <h1 className="display-xl mb-8">
              {greeting}, {name}.<br />
              Ваш доступ откроется {access.startDate.toLocaleDateString("ru-RU")}.
            </h1>
            <p className="text-lg md:text-2xl text-ink-foreground/75 max-w-2xl font-display font-medium leading-snug mb-10">
              Вы уже внутри платформы. Как только наступит дата, установленная администратором, откроется первый день курса.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-amber/40 bg-amber/10 px-5 py-3 text-amber">
                <CalendarDays className="h-5 w-5" />
                <span className="font-mono text-xs uppercase tracking-[0.2em]">Старт {access.startDate.toLocaleDateString("ru-RU")}</span>
              </div>
              <Button asChild variant="amber" size="xl">
                <Link to="/program">Смотреть программу</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-ink text-ink-foreground overflow-hidden">
        <div className="absolute -right-20 -top-20 h-[28rem] w-[28rem] rounded-full bg-amber/25 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-hot/20 blur-3xl" />

        {/* top editorial bar */}
        <div className="relative border-b border-ink-foreground/15">
          <div className="container flex items-center justify-between py-3 text-[11px] font-mono uppercase tracking-[0.22em] text-ink-foreground/70">
            <span>Issue №{String(access.daysElapsed).padStart(2, "0")}</span>
            <span className="hidden sm:inline">Творческая мастерская · ежедневно</span>
            <span>{new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })}</span>
          </div>
        </div>

        <div className="container relative py-14 md:py-24">
          <div className="flex items-center gap-2 eyebrow text-amber mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            {greeting}, {name}
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-amber font-mono text-sm tracking-[0.3em]">
                  ДЕНЬ {String(access.daysElapsed).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-amber/40 max-w-[140px]" />
                <span className="text-ink-foreground/50 font-mono text-xs tracking-widest">/ 30</span>
              </div>
              <h1 className="display-xl">
                <span className="block">{lesson?.title ?? "Сегодняшний урок готовится"}</span>
              </h1>
              {lesson?.goal && (
                <p className="mt-8 text-lg md:text-2xl text-ink-foreground/80 max-w-2xl font-display font-medium leading-snug">
                  {lesson.goal}
                </p>
              )}
            </div>
            <div className="lg:col-span-4">
              <div className="border-2 border-amber rounded-3xl p-7 bg-amber/10 backdrop-blur shadow-amber">
                <div className="eyebrow text-amber mb-4">Ваш маршрут</div>
                <div className="flex items-end gap-2 mb-1">
                  <div className="font-display font-black text-7xl leading-none text-amber">{completedCount}</div>
                  <div className="text-ink-foreground/70 pb-2 font-mono text-xs uppercase tracking-widest">/ 30 дней</div>
                </div>
                <div className="h-2.5 bg-ink-foreground/10 rounded-full overflow-hidden mt-5">
                  <div
                    className="h-full bg-gradient-amber transition-all"
                    style={{ width: `${(completedCount / 30) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-ink-foreground/60 mt-4 font-mono uppercase tracking-widest">
                  Осталось {access.daysRemaining} {access.daysRemaining === 1 ? "день" : "дней"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
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

      {/* MARQUEE BAND */}
      <section className="bg-amber text-amber-foreground border-y-2 border-foreground overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee py-4">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex items-center shrink-0">
              {["писать каждый день", "★", "одна страница больше", "★", "ритм мастерской", "★", "30 дней — одна книга", "★"].map((t, i) => (
                <span key={i} className="marquee-band px-6">{t}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* QUICK NAV */}
      <section className="container py-16 md:py-24">
        <div className="flex items-end justify-between mb-10 pb-4 border-b-2 border-foreground">
          <div>
            <div className="eyebrow text-muted-foreground mb-2">Куда дальше</div>
            <h2 className="display-md">Сегодня — один маленький шаг.</h2>
          </div>
          <div className="hidden md:block font-mono text-xs tracking-[0.25em] uppercase text-muted-foreground">№ 03 секций</div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <Link
            to="/program"
            className="group rounded-3xl bg-card border-2 border-foreground p-8 hover:bg-foreground hover:text-background transition-all hover:-translate-y-1 hover:shadow-bold"
          >
            <div className="font-display font-black text-7xl leading-none text-foreground/15 group-hover:text-background/30 mb-8 transition-colors">01</div>
            <h3 className="display-md text-3xl mb-3">Программа</h3>
            <p className="text-sm opacity-70">Все 30 дней мастерской — карта маршрута.</p>
          </Link>

          <Link
            to="/progress"
            className="group rounded-3xl bg-amber text-amber-foreground p-8 hover:-translate-y-1 transition-all hover:shadow-amber border-2 border-foreground"
          >
            <div className="font-display font-black text-7xl leading-none text-amber-foreground/30 mb-8">02</div>
            <h3 className="display-md text-3xl mb-3">Прогресс</h3>
            <p className="text-sm text-amber-foreground/85">Сколько уже пройдено. Где вы сейчас.</p>
          </Link>

          <Link
            to="/materials"
            className="group rounded-3xl bg-foreground text-background p-8 hover:-translate-y-1 transition-all hover:shadow-bold border-2 border-foreground"
          >
            <div className="font-display font-black text-7xl leading-none text-background/25 mb-8">03</div>
            <h3 className="display-md text-3xl mb-3">Материалы</h3>
            <p className="text-sm text-background/75">Тетрадь, шаблоны, чек-листы.</p>
          </Link>
        </div>
      </section>

      {/* QUOTE */}
      <section className="border-y-2 border-foreground bg-hot text-hot-foreground">
        <div className="container py-20 md:py-32 text-center relative">
          <div className="font-display font-black text-[12rem] md:text-[18rem] leading-none absolute top-2 left-1/2 -translate-x-1/2 opacity-10 select-none">«»</div>
          <div className="eyebrow mb-6 relative">Из мастерской</div>
          <p className="display-lg max-w-4xl mx-auto relative">
            Книгу нельзя написать вчера. Её можно написать только сегодня — на одну страницу больше.
          </p>
        </div>
      </section>
    </div>
  );
}
