import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, ListChecks, BookMarked, ExternalLink } from "lucide-react";

interface Material {
  id: string;
  title: string;
  description: string | null;
  category: string;
  url: string | null;
}

const categoryMeta: Record<string, { label: string; Icon: any; tone: string }> = {
  workbook: { label: "Тетрадь", Icon: BookMarked, tone: "bg-ink text-ink-foreground" },
  template: { label: "Шаблон", Icon: FileText, tone: "bg-amber text-amber-foreground" },
  checklist: { label: "Чек-лист", Icon: ListChecks, tone: "bg-foreground text-background" },
  general: { label: "Материал", Icon: FileText, tone: "bg-card border-2 border-foreground/15" },
};

export default function Materials() {
  const [items, setItems] = useState<Material[]>([]);

  useEffect(() => {
    supabase
      .from("materials")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setItems(data ?? []));
  }, []);

  return (
    <div className="container py-10 md:py-16">
      <div className="max-w-3xl mb-12">
        <div className="eyebrow text-amber mb-3">Материалы курса</div>
        <h1 className="display-lg mb-5">Всё, что нужно — под рукой.</h1>
        <p className="text-lg text-muted-foreground">
          Тетрадь, шаблоны, чек-листы и памятки. Скачивайте и работайте в удобном для вас месте — Word, Google Docs, на бумаге.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((m) => {
          const meta = categoryMeta[m.category] ?? categoryMeta.general;
          const Icon = meta.Icon;
          return (
            <article key={m.id} className={`rounded-2xl p-7 ${meta.tone} flex flex-col`}>
              <div className="flex items-center justify-between mb-6">
                <span className="eyebrow opacity-80">{meta.label}</span>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-2xl leading-tight mb-3 flex-1">{m.title}</h3>
              {m.description && <p className="text-sm opacity-75 mb-6">{m.description}</p>}
              {m.url ? (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 font-semibold text-sm border-b border-current pb-1 self-start hover:gap-3 transition-all"
                >
                  Открыть <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm opacity-60">
                  <Download className="h-4 w-4" /> Скоро
                </span>
              )}
            </article>
          );
        })}
        {items.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            Материалы скоро появятся здесь.
          </div>
        )}
      </div>
    </div>
  );
}
