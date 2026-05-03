import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImg from "@/assets/hero.jpg";

const getRedirectUrl = () => {
  const { origin, pathname } = window.location;
  // Берём базовый путь приложения (всё до /auth)
  const basePath = pathname.replace(/\/auth.*$/, "/").replace(/\/+$/, "/") || "/";
  return `${origin}${basePath}`;
};

export default function Auth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  if (hasSession) return <Navigate to="/" replace />;

  const sendLink = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setMessage("Введите e-mail, который вы указали при оплате.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo: REDIRECT_URL },
      });
      if (error) throw error;
      setSent(true);
    } catch {
      setMessage("Не получилось отправить письмо. Проверьте e-mail или напишите куратору.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendLink();
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative bg-ink text-ink-foreground p-8 lg:p-14 flex-col justify-between overflow-hidden hidden lg:flex">
        <div className="absolute inset-0 opacity-30">
          <img src={heroImg} alt="" className="w-full h-full object-cover mix-blend-screen" width={1536} height={1024} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-amber flex items-center justify-center">
              <span className="font-display font-black text-ink text-xl leading-none">М</span>
            </div>
            <div className="font-display font-bold text-lg">Мастерская книги</div>
          </div>
        </div>
        <div className="relative space-y-6">
          <div className="eyebrow text-amber">30 дней · творческая работа</div>
          <h1 className="display-xl">
            Книга, <br />
            <span className="text-amber">которую</span> <br />
            вы напишете.
          </h1>
          <p className="text-base lg:text-lg text-ink-foreground/70 max-w-md font-sans">
            Закрытая платформа курса. Каждый день — один ясный шаг.
          </p>
        </div>
        <div className="relative text-xs text-ink-foreground/50 font-mono uppercase tracking-widest">
          ЕЖЕДНЕВНО · ЛИЧНО · ПО МАРШРУТУ
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-md bg-ink flex items-center justify-center">
              <span className="font-display font-black text-amber text-xl leading-none">М</span>
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-tight">Мастерская</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">книги</div>
            </div>
          </div>

          <div>
            <div className="eyebrow text-amber mb-3">Курс</div>
            <h2 className="display-lg">Вход в Мастерскую</h2>
            {!sent && (
              <p className="text-muted-foreground mt-3">
                Введите e-mail, который вы указали при оплате. Мы отправим вам личную ссылку для входа.
              </p>
            )}
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="rounded-2xl border-2 border-foreground/10 bg-accent/10 p-6 space-y-3">
                <p className="font-display text-xl">Мы отправили ссылку для входа на вашу почту.</p>
                <p className="text-muted-foreground">
                  Откройте письмо и нажмите на кнопку внутри. Если письма нет, проверьте папку «Спам».
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                disabled={loading}
                onClick={sendLink}
              >
                {loading ? "Минутку…" : "Отправить ссылку ещё раз"}
              </Button>
              {message && <p className="text-sm text-center text-muted-foreground">{message}</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-12"
                  autoComplete="email"
                />
              </div>

              <Button type="submit" variant="amber" size="lg" className="w-full" disabled={loading}>
                {loading ? "Отправляем…" : "Получить ссылку для входа"}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Письмо обычно приходит в течение минуты. Если его нет, проверьте папку «Спам».
              </p>

              {message && (
                <p className="text-sm text-center text-foreground/80 bg-amber/10 rounded-md p-3">{message}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
