import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImg from "@/assets/hero.jpg";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
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

  const login = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setMessage("Введите e-mail, который вы указали при оплате.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke("simple-login", {
        body: { email: normalizedEmail },
      });
      if (error || !data?.token_hash) {
        setMessage(data?.error || "Не получилось войти. Проверьте e-mail или напишите куратору.");
        setLoading(false);
        return;
      }
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: "magiclink",
        token_hash: data.token_hash,
      });
      if (verifyError) {
        setMessage("Не получилось войти. Попробуйте ещё раз.");
        setLoading(false);
        return;
      }
      // onAuthStateChange сделает редирект
    } catch {
      setMessage("Не получилось войти. Проверьте подключение к интернету.");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
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
            <p className="text-muted-foreground mt-3">
              Введите e-mail, который вы указали при оплате — и сразу попадёте в курс.
            </p>
          </div>

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
              {loading ? "Входим…" : "Войти"}
            </Button>

            {message && (
              <p className="text-sm text-center text-foreground/80 bg-amber/10 rounded-md p-3">{message}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
