import { useState, type ComponentProps } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const CYRILLIC_RE = /[А-Яа-яЁё]/;

export const hasCyrillicChars = (value: string) => CYRILLIC_RE.test(value);

type PasswordFieldProps = Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  showLayoutWarning?: boolean;
};

export function PasswordField({
  id,
  label,
  value,
  onValueChange,
  className,
  disabled,
  showLayoutWarning = true,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hasCyrillic = showLayoutWarning && !disabled && hasCyrillicChars(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn("h-12 pr-12", className)}
          disabled={disabled}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-10 w-10 text-muted-foreground hover:bg-accent/30"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
          title={visible ? "Скрыть пароль" : "Показать пароль"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {hasCyrillic && (
        <p className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          В пароле есть русские буквы. Если это не специально, переключите раскладку или нажмите глаз, чтобы проверить ввод.
        </p>
      )}
    </div>
  );
}