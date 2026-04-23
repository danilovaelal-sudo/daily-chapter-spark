import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, getAccessInfo } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Lightbulb, Target, ListChecks } from "lucide-react";
import { toast } from "sonner";

interface Lesson {
  id: string;
  day_number: number;
  title: string;
  goal: string | null;
  content: string | null;
  task: string | null;
  hints: string | null;
  checklist: string[];
}

export default function Lesson() {
  const { day } = useParams<{ day: string }>();
  const dayNum = parseInt(day || "1", 10);
  const { user, profile } = useAuth();
  const access = getAccessInfo(profile?.start_date);
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [done, setDone] = useState(false);
  const [checks, setChecks] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: l } = await supabase.from("lessons").select("*").eq("day_number", dayNum).maybeSingle();
      if (l) {
        const cl = Array.isArray(l.checklist) ? (l.checklist as string[]) : [];
        setLesson({ ...l, checklist: cl });
        const { data: p } = await supabase
          .from("lesson_progress")
          .select("completed")
          .eq("user_id", user.id)
          .eq("lesson_id", l.id)
          .maybeSingle();
        setDone(!!p?.completed);
      }
    })();
  }, [user, dayNum]);

  if (dayNum > access.daysElapsed) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <Lock className="h-12 w-12 mx-auto mb-6 text-muted-foreground" />
        <h1 className="display-md mb-3">День ещё не открыт</h1>
        <p className="text-muted-foreground mb-6">
          Мастерская идёт в ритме одного дня. Этот урок откроется на {dayNum}-й день вашего курса.
        </p>
        <Button asChild variant="ink"><Link to="/program">К программе</Link></Button>
      </div>
    );
  }

  if (!lesson) {
    return <div className="container py-20 text-center text-muted-foreground">Загружаем урок…</div>;
  }

  const handleComplete = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("lesson_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: "user_id,lesson_id" });
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    toast.success("Шаг сделан. Возвращайтесь завтра.");
  };

  const toggleCheck = (i: number) => {
    setChecks((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <article className="pb-20">
      {/* Header */}
      <div className="bg-ink text-ink-foreground">
        <div className="container py-10 md:py-14">
          <Link to="/program" className="inline-flex items-center gap-2 text-amber hover:underline mb-8 text-sm">
            <ArrowLeft className="h-4 w-4" /> Программа
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-mono text-xs tracking-widest text-amber bg-amber/10 px-3 py-1.5 rounded-full">
              ДЕНЬ {String(lesson.day_number).padStart(2, "0")} / 30
            </span>
            {done && (
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold bg-amber text-amber-foreground px-3 py-1.5 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5" /> Выполнено
              </span>
            )}
          </div>
          <h1 className="display-lg max-w-4xl">{lesson.title}</h1>
        </div>
      </div>

      <div className="container py-10 md:py-14 max-w-3xl">
        {lesson.goal && (
          <section className="mb-10">
            <div className="flex items-center gap-2 eyebrow text-amber mb-3">
              <Target className="h-3.5 w-3.5" /> Цель дня
            </div>
            <p className="display-md">{lesson.goal}</p>
          </section>
        )}

        {lesson.content && (
          <section className="mb-10">
            <div className="eyebrow text-muted-foreground mb-3">Урок</div>
            <div className="prose prose-lg max-w-none text-foreground whitespace-pre-line leading-relaxed">
              {lesson.content}
            </div>
          </section>
        )}

        {lesson.task && (
          <section className="mb-10 bg-amber rounded-2xl p-6 md:p-8 text-amber-foreground">
            <div className="eyebrow mb-3">Задание</div>
            <p className="text-lg md:text-xl font-medium whitespace-pre-line">{lesson.task}</p>
          </section>
        )}

        {lesson.hints && (
          <section className="mb-10 border-l-4 border-amber pl-6 py-2">
            <div className="flex items-center gap-2 eyebrow text-muted-foreground mb-3">
              <Lightbulb className="h-3.5 w-3.5 text-amber" /> Подсказки
            </div>
            <p className="text-base whitespace-pre-line text-foreground/80">{lesson.hints}</p>
          </section>
        )}

        {lesson.checklist.length > 0 && (
          <section className="mb-10 bg-card border-2 border-foreground/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2 eyebrow text-muted-foreground mb-5">
              <ListChecks className="h-4 w-4" /> Чек-лист дня
            </div>
            <ul className="space-y-3">
              {lesson.checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Checkbox
                    id={`c-${i}`}
                    checked={checks.has(i)}
                    onCheckedChange={() => toggleCheck(i)}
                    className="mt-1"
                  />
                  <label htmlFor={`c-${i}`} className={checks.has(i) ? "line-through text-muted-foreground" : ""}>
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        {done && (
          <div className="rounded-2xl bg-amber/15 border-2 border-amber/40 p-6 text-center my-8 animate-fade-up">
            <div className="font-display font-bold text-2xl">Шаг сделан. Идём дальше.</div>
          </div>
        )}

        <div className="border-t-2 border-foreground/10 pt-8 mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Button onClick={handleComplete} variant={done ? "outline" : "amber"} size="lg" className="flex-1 sm:flex-none">
            {done ? "Урок отмечен как выполненный" : "Отметить как выполнено"}
            {!done && <CheckCircle2 className="ml-1" />}
          </Button>
          <div className="flex gap-2">
            {dayNum > 1 && (
              <Button variant="outline" size="lg" onClick={() => navigate(`/lesson/${dayNum - 1}`)}>
                <ArrowLeft />
              </Button>
            )}
            {dayNum < 30 && dayNum < access.daysElapsed && (
              <Button variant="ink" size="lg" onClick={() => navigate(`/lesson/${dayNum + 1}`)}>
                Следующий день <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
