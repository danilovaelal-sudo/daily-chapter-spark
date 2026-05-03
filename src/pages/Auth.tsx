import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField, hasCyrillicChars } from "@/components/PasswordField";
import { toast } from "sonner";
import heroImg from "@/assets/hero.jpg";

const getAppBaseUrl = () => {
  const basePath = import.meta.env.BASE_URL || "/";
  const shouldUseBasePath = basePath !== "/" && window.location.pathname.startsWith(basePath);

  return `${window.location.origin}${shouldUseBasePath ? basePath : "/"}`;
};

const appUrl = (path = "") => new URL(path.replace(/^\//, ""), getAppBaseUrl()).toString();

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "email-link" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: appUrl("reset-password"),
        });
        if (error) throw error;
        toast.success("Отправили письмо для смены пароля.");
        setMode("signin");
      } else if (mode === "email-link") {
        const { error } = await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: { emailRedirectTo: appUrl() },
        });
        if (error) throw error;
        toast.success("Отправили ссылку для входа. Откройте письмо и нажмите кнопку входа.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        toast.success("С возвращением");
        navigate("/");
      }
    } catch (err: any) {
      const message = err?.message ?? "Что-то пошло не так";
      if (message.toLowerCase().includes("invalid login credentials")) {
        toast.error(
          hasCyrillicChars(password)
            ? "В пароле есть русские буквы, похожие на латинские. Нажмите глаз рядом с паролем и проверьте раскладку."
            : "Неверный e-mail или пароль. Если входите с другого браузера, нажмите «Сбросить пароль».",
        );
      } else {
        toast.error(message);
      }
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
            <h2 className="display-lg">
              {mode === "email-link" ? "Войти по письму" : mode === "forgot" ? "Сбросить пароль" : "Вход"}
            </h2>
            <p className="text-muted-foreground mt-3">
              {mode === "email-link"
                ? "Введите e-mail — мы пришлём ссылку, по которой можно войти без пароля."
                : mode === "forgot"
                  ? "Если входите с нового браузера и пароль не подходит, отправьте себе ссылку для смены пароля."
                  : "Введите e-mail и пароль. Если пароль снова мешает — выберите вход по письму."}
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
                required
                autoComplete="email"
              />
            </div>

            {mode === "signin" && (
              <PasswordField
                id="password"
                label="Пароль"
                value={password}
                onValueChange={setPassword}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="current-password"
              />
            )}

            <Button type="submit" variant="amber" size="lg" className="w-full" disabled={loading}>
              {loading ? "Минутку…" : mode === "forgot" ? "Сменить пароль" : mode === "email-link" ? "Прислать ссылку для входа" : "Войти"}
            </Button>
          </form>

          <div className="space-y-3 text-center text-sm text-muted-foreground">
            <div>
              {mode === "email-link" ? "Хотите войти с паролем?" : mode === "forgot" ? "Вспомнили пароль?" : "Не хотите вводить пароль?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "email-link" : "signin")}
                className="font-semibold text-foreground underline underline-offset-4 hover:text-amber"
              >
                {mode === "signin" ? "Войти по ссылке из письма" : "Войти с паролем"}
              </button>
            </div>

            {mode !== "forgot" ? (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="font-semibold text-foreground underline underline-offset-4 hover:text-amber"
              >
                Сбросить пароль
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-semibold text-foreground underline underline-offset-4 hover:text-amber"
              >
                Назад ко входу
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
