import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/PasswordField";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, User as UserIcon } from "lucide-react";

export default function Account() {
  const { user, profile, reloadProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const saveName = async () => {
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    setSavingName(false);
    if (error) return toast.error(error.message);
    toast.success("Имя обновлено");
    reloadProfile(user.id);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Минимум 6 символов");
    if (password !== confirm) return toast.error("Пароли не совпадают");
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPwd(false);
    if (error) return toast.error(error.message);
    toast.success("Пароль обновлён");
    setPassword("");
    setConfirm("");
  };

  return (
    <div className="container py-10 md:py-14 max-w-2xl">
      <div className="eyebrow text-amber mb-3">Личный кабинет</div>
      <h1 className="display-lg mb-8">Настройки</h1>

      <section className="rounded-2xl border-2 border-foreground/10 bg-card p-6 mb-6">
        <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
          <UserIcon className="h-5 w-5" /> Профиль
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Имя</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ваше имя" />
          </div>
          <Button variant="ink" onClick={saveName} disabled={savingName}>
            {savingName ? "Сохраняем..." : "Сохранить имя"}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border-2 border-foreground/10 bg-card p-6">
        <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5" /> Смена пароля
        </h2>
        <form onSubmit={changePassword} className="space-y-4">
          <PasswordField id="account-new-password" label="Новый пароль" value={password} onValueChange={setPassword} required minLength={6} autoComplete="new-password" />
          <PasswordField id="account-confirm-password" label="Повторите пароль" value={confirm} onValueChange={setConfirm} required minLength={6} autoComplete="new-password" />
          <Button type="submit" variant="amber" disabled={savingPwd}>
            {savingPwd ? "Обновляем..." : "Сменить пароль"}
          </Button>
        </form>
      </section>

      <div className="mt-8">
        <Button variant="outline" onClick={() => navigate(-1)}>Назад</Button>
      </div>
    </div>
  );
}
