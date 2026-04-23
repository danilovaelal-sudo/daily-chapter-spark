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
  workbook: { label: "Тетрадь", Icon: BookMarked, tone: "bg-ink text-ink-foreground border-foreground" },
  template: { label: "Шаблон", Icon: FileText, tone: "bg-amber text-amber-foreground border-foreground" },
  checklist: { label: "Чек-лист", Icon: ListChecks, tone: "bg-hot text-hot-foreground border-foreground" },
  general: { label: "Материал", Icon: FileText, tone: "bg-card border-foreground" },
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
    <div>
      <div className="bg-ink text-ink-foreground border-b-2 border-foreground">
        <div className="container py-12 md:py-20">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="eyebrow text-amber mb-4">Материалы курса</div>
              <h1 className="display-xl">Всё нужное —<br/><span className="text-amber">под рукой.</span></h1>
            </div>
            <div className="lg:col-span-4">
              <p className="text-lg text-ink-foreground/80 font-display font-medium leading-snug">
                Тетрадь, шаблоны, чек-листы. Скачивайте и работайте удобным способом — Word, Google Docs, на бумаге.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-14 md:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((m) => {
            const meta = categoryMeta[m.category] ?? categoryMeta.general;
            const Icon = meta.Icon;
            return (
              <article key={m.id} className={`rounded-3xl p-8 border-2 ${meta.tone} flex flex-col transition-all hover:-translate-y-1 hover:shadow-bold`}>
                <div className="flex items-center justify-between mb-8">
                  <span className="eyebrow opacity-90">{meta.label}</span>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-black text-2xl leading-tight mb-3 flex-1">{m.title}</h3>
                {m.description && <p className="text-sm opacity-80 mb-6">{m.description}</p>}
                {m.url ? (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 font-bold text-sm border-b-2 border-current pb-1 self-start hover:gap-3 transition-all uppercase tracking-widest"
                  >
                    Открыть <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm opacity-60 uppercase tracking-widest font-bold">
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
    </div>
  );
}
