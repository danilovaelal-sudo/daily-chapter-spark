import { Button } from "@/components/ui/button";
import { MessageCircle, Compass, Heart } from "lucide-react";

const SUPPORT_URL = "https://vk.me/danilovaelal";

export default function Support() {
  return (
    <div className="container py-10 md:py-16">
      <div className="max-w-3xl mb-12">
        <div className="eyebrow text-amber mb-3">Поддержка</div>
        <h1 className="display-lg mb-5">Вы не одни в этом пути.</h1>
        <p className="text-lg text-muted-foreground">
          Если что-то не складывается — напишите. Куратор отвечает в рабочее время и помогает вернуться в маршрут.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-12">
        <div className="rounded-2xl bg-ink text-ink-foreground p-8 md:p-10">
          <MessageCircle className="h-7 w-7 text-amber mb-6" />
          <div className="eyebrow text-amber mb-3">Напишите куратору</div>
          <h2 className="display-md mb-4">Личный чат</h2>
          <p className="text-ink-foreground/75 mb-7">
            Любые вопросы по курсу, заданиям и тексту вашей книги — пишите напрямую.
          </p>
          <Button asChild variant="amber" size="lg">
            <a href={SUPPORT_URL} target="_blank" rel="noopener">
              Написать в чат
            </a>
          </Button>
        </div>

        <div className="rounded-2xl bg-amber text-amber-foreground p-8 md:p-10">
          <Compass className="h-7 w-7 mb-6" />
          <div className="eyebrow mb-3">Что делать, если я застрял</div>
          <h2 className="display-md mb-4">Маленький план</h2>
          <ol className="space-y-3 text-amber-foreground/90 list-decimal list-inside">
            <li>Не пытайтесь нагнать — вернитесь к текущему дню.</li>
            <li>Выполните задание из урока — даже коротко.</li>
            <li>Если не идёт — напишите куратору в чат.</li>
            <li>Завтра — новый шаг. Курс ведёт за руку.</li>
          </ol>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-foreground/10 bg-card p-8 md:p-10 text-center">
        <Heart className="h-7 w-7 text-amber mx-auto mb-5" />
        <p className="display-md max-w-2xl mx-auto">
          Книга пишется по чуть-чуть. Самое главное — продолжать.
        </p>
        <p className="text-muted-foreground mt-4">
          У вас уже больше, чем у того, кто ещё не начал.
        </p>
      </div>
    </div>
  );
}
