import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  const hasRecoveryToken = useMemo(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return params.get("type") === "recovery";
  }, []);

  useEffect(() => {
    if (hasRecoveryToken) {
      setReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(!!session);
    });
  }, [hasRecoveryToken]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Пароль должен быть не короче 6 символов.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Пароли не совпадают.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Пароль обновлён. Теперь можно войти.");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3">
          <div className="eyebrow text-amber">Безопасный вход</div>
          <h1 className="display-lg">Новый пароль</h1>
          <p className="text-muted-foreground">
            {ready
              ? "Задайте новый пароль для входа в мастерскую."
              : "Откройте страницу по ссылке из письма, чтобы сменить пароль."}
          </p>
        </div>

        {ready ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Повторите пароль</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12"
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" variant="amber" size="lg" className="w-full" disabled={loading}>
              {loading ? "Сохраняем…" : "Сохранить пароль"}
            </Button>
          </form>
        ) : (
          <Button asChild variant="amber" size="lg" className="w-full">
            <Link to="/auth">Вернуться ко входу</Link>
          </Button>
        )}
      </div>
    </div>
  );
}