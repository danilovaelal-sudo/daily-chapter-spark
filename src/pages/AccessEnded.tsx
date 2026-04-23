import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function AccessEnded() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-ink text-ink-foreground flex items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <Lock className="h-10 w-10 text-amber mx-auto mb-8" />
        <div className="eyebrow text-amber mb-4">Доступ завершён</div>
        <h1 className="display-lg mb-6">30 дней мастерской пройдены.</h1>
        <p className="text-ink-foreground/75 text-lg mb-10">
          Спасибо, что прошли этот путь. Если хотите продлить доступ или присоединиться к новому потоку — напишите куратору.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="amber" size="lg">
            <a href="https://vk.me/danilovaelal" target="_blank" rel="noopener">Написать куратору</a>
          </Button>
          <Button variant="outline" size="lg" onClick={signOut} className="border-ink-foreground/30 text-ink-foreground hover:bg-ink-foreground hover:text-ink">
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
}
