import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import heroImg from "@/assets/hero.jpg";

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  if (hasSession) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Аккаунт создан. Добро пожаловать в мастерскую.");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("С возвращением");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left — editorial hero */}
      <div className="relative bg-ink text-ink-foreground p-8 lg:p-14 flex flex-col justify-between overflow-hidden hidden lg:flex">
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
            Книга, <br/>
            <span className="text-amber">которую</span> <br/>
            вы напишете.
          </h1>
          <p className="text-base lg:text-lg text-ink-foreground/70 max-w-md font-sans">
            Закрытая платформа курса. Каждый день — один ясный шаг. Подсказки, задания, чек-листы и поддержка куратора.
          </p>
        </div>
        <div className="relative text-xs text-ink-foreground/50 font-mono uppercase tracking-widest">
          ЕЖЕДНЕВНО · ЛИЧНО · ПО МАРШРУТУ
        </div>
      </div>

      {/* Right — form */}
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
            <div className="eyebrow text-amber mb-3">Вход в курс</div>
            <h2 className="display-lg">{mode === "signup" ? "Создать аккаунт" : "С возвращением"}</h2>
            <p className="text-muted-foreground mt-3">
              {mode === "signup"
                ? "Доступ выдаёт куратор после оплаты. Создайте профиль с тем e-mail, который вы передали."
                : "Введите e-mail и пароль, чтобы продолжить путь."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Как к вам обращаться</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Имя"
                  className="h-12"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-12"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12"
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>

            <Button type="submit" variant="amber" size="lg" className="w-full" disabled={loading}>
              {loading ? "Минутку…" : mode === "signup" ? "Создать аккаунт" : "Войти"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Уже есть аккаунт?" : "Впервые здесь?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-semibold text-foreground underline underline-offset-4 hover:text-amber"
            >
              {mode === "signup" ? "Войти" : "Создать аккаунт"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
