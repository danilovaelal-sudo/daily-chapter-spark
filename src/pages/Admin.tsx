import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Edit, Save, Users, BookOpen, Folder, Plus, Trash2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  start_date: string;
}

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

interface Material {
  id: string;
  title: string;
  description: string | null;
  category: string;
  url: string | null;
  sort_order: number;
}

export default function Admin() {
  return (
    <div className="container py-10 md:py-14">
      <div className="eyebrow text-amber mb-3">Админ-панель</div>
      <h1 className="display-lg mb-8">Управление мастерской</h1>

      <Tabs defaultValue="users">
        <TabsList className="mb-8">
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" /> Пользователи</TabsTrigger>
          <TabsTrigger value="lessons"><BookOpen className="h-4 w-4 mr-2" /> Уроки</TabsTrigger>
          <TabsTrigger value="materials"><Folder className="h-4 w-4 mr-2" /> Материалы</TabsTrigger>
        </TabsList>

        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="lessons"><LessonsTab /></TabsContent>
        <TabsContent value="materials"><MaterialsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const load = async () => {
    const { data: profs } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(profs ?? []);
    const { data: prog } = await supabase.from("lesson_progress").select("user_id").eq("completed", true);
    const map: Record<string, number> = {};
    (prog ?? []).forEach((p: any) => { map[p.user_id] = (map[p.user_id] ?? 0) + 1; });
    setProgress(map);
  };

  useEffect(() => { load(); }, []);

  const updateStartDate = async (id: string, date: string) => {
    const { error } = await supabase.from("profiles").update({ start_date: date }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Дата старта обновлена");
    load();
  };

  const removeUser = async (id: string, email: string | null) => {
    if (!confirm(`Удалить пользователя ${email ?? id}? Это действие необратимо.`)) return;
    const { error } = await supabase.functions.invoke("delete-user", { body: { userId: id } });
    if (error) { toast.error(error.message); return; }
    toast.success("Пользователь удалён");
    load();
  };

  return (
    <div>
      <p className="text-muted-foreground mb-6 text-sm">
        Чтобы добавить пользователя — попросите его зарегистрироваться, затем здесь установите дату старта. Доступ действует 30 дней с этой даты.
      </p>
      <div className="border-2 border-foreground/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-foreground text-background">
            <tr>
              <th className="text-left p-4 font-semibold">Имя</th>
              <th className="text-left p-4 font-semibold">E-mail</th>
              <th className="text-left p-4 font-semibold">Старт</th>
              <th className="text-left p-4 font-semibold">Прогресс</th>
              <th className="text-left p-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const start = new Date(u.start_date);
              const today = new Date();
              const day = Math.min(30, Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1));
              return (
                <tr key={u.id} className="border-t border-foreground/10">
                  <td className="p-4">{u.full_name || "—"}</td>
                  <td className="p-4 text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    <input
                      type="date"
                      defaultValue={u.start_date}
                      onBlur={(e) => e.target.value !== u.start_date && updateStartDate(u.id, e.target.value)}
                      className="border border-foreground/20 rounded-md px-2 py-1 bg-background"
                    />
                    <div className="text-xs text-muted-foreground mt-1">День {day}/30</div>
                  </td>
                  <td className="p-4 font-mono">{progress[u.id] ?? 0}/30</td>
                  <td className="p-4">
                    <button
                      onClick={() => removeUser(u.id, u.email)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Удалить пользователя"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Пока нет пользователей</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LessonsTab() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editing, setEditing] = useState<Lesson | null>(null);

  const load = async () => {
    const { data } = await supabase.from("lessons").select("*").order("day_number");
    setLessons((data ?? []).map((l: any) => ({ ...l, checklist: Array.isArray(l.checklist) ? l.checklist : [] })));
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const { error } = await supabase.from("lessons").update({
      title: editing.title,
      goal: editing.goal,
      content: editing.content,
      task: editing.task,
      hints: editing.hints,
      checklist: editing.checklist,
    }).eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Урок сохранён");
    setEditing(null);
    load();
  };

  if (editing) {
    return (
      <div className="max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="display-md">День {editing.day_number}</h2>
          <Button variant="outline" onClick={() => setEditing(null)}>Назад</Button>
        </div>
        <div className="space-y-2">
          <Label>Название</Label>
          <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Цель дня</Label>
          <Textarea value={editing.goal ?? ""} onChange={(e) => setEditing({ ...editing, goal: e.target.value })} rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Содержание урока</Label>
          <Textarea value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={8} />
        </div>
        <div className="space-y-2">
          <Label>Задание</Label>
          <Textarea value={editing.task ?? ""} onChange={(e) => setEditing({ ...editing, task: e.target.value })} rows={4} />
        </div>
        <div className="space-y-2">
          <Label>Подсказки</Label>
          <Textarea value={editing.hints ?? ""} onChange={(e) => setEditing({ ...editing, hints: e.target.value })} rows={4} />
        </div>
        <div className="space-y-2">
          <Label>Чек-лист (по строке на пункт)</Label>
          <Textarea
            value={editing.checklist.join("\n")}
            onChange={(e) => setEditing({ ...editing, checklist: e.target.value.split("\n").filter(Boolean) })}
            rows={5}
          />
        </div>
        <Button variant="amber" size="lg" onClick={save}><Save className="mr-2 h-4 w-4" /> Сохранить</Button>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {lessons.map((l) => (
        <button
          key={l.id}
          onClick={() => setEditing(l)}
          className="text-left rounded-2xl border-2 border-foreground/10 bg-card p-5 hover:border-amber transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-display font-black text-3xl">{String(l.day_number).padStart(2, "0")}</span>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="font-semibold text-sm line-clamp-2">{l.title}</div>
        </button>
      ))}
    </div>
  );
}

function MaterialsTab() {
  const [items, setItems] = useState<Material[]>([]);
  const [editing, setEditing] = useState<Partial<Material> | null>(null);

  const load = async () => {
    const { data } = await supabase.from("materials").select("*").order("sort_order");
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title) { toast.error("Введите название"); return; }
    const payload = {
      title: editing.title,
      description: editing.description ?? null,
      category: editing.category ?? "general",
      url: editing.url ?? null,
      sort_order: editing.sort_order ?? items.length,
    };
    const { error } = editing.id
      ? await supabase.from("materials").update(payload).eq("id", editing.id)
      : await supabase.from("materials").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить материал?")) return;
    await supabase.from("materials").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <Button variant="ink" onClick={() => setEditing({ category: "general", sort_order: items.length })}>
        <Plus className="h-4 w-4 mr-1" /> Новый материал
      </Button>

      {editing && (
        <div className="rounded-2xl border-2 border-amber bg-amber/5 p-6 space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Категория</Label>
              <select
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-foreground/20 bg-background"
              >
                <option value="workbook">Тетрадь</option>
                <option value="template">Шаблон</option>
                <option value="checklist">Чек-лист</option>
                <option value="general">Материал</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Порядок</Label>
              <Input
                type="number"
                value={editing.sort_order ?? 0}
                onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ссылка (Google Docs / PDF)</Label>
            <Input value={editing.url ?? ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex gap-2">
            <Button variant="amber" onClick={save}>Сохранить</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Отмена</Button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((m) => (
          <div key={m.id} className="rounded-2xl border-2 border-foreground/10 bg-card p-5">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{m.category}</span>
              <div className="flex gap-1">
                <button onClick={() => setEditing(m)} className="p-1 hover:text-amber"><Edit className="h-4 w-4" /></button>
                <button onClick={() => remove(m.id)} className="p-1 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="font-semibold mb-1">{m.title}</div>
            {m.description && <div className="text-xs text-muted-foreground line-clamp-2">{m.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
