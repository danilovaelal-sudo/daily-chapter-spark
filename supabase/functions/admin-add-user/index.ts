import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const admin = createClient(url, serviceKey);
    const { data: roleRow } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.full_name ?? "").trim();
    const startDate = body.start_date ? String(body.start_date) : new Date().toISOString().slice(0, 10);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Некорректный e-mail" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Проверка, что не существует
    const { data: existing } = await admin.from("profiles").select("id").ilike("email", email).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ error: "Такой участник уже добавлен" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Создаём пользователя в auth с подтверждённым email и случайным паролем (никто его не использует)
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: randomPassword,
      user_metadata: { full_name: fullName },
    });
    if (createErr || !created.user) {
      return new Response(JSON.stringify({ error: createErr?.message ?? "Не удалось создать пользователя" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Профиль создаётся триггером, обновим start_date и full_name
    await admin.from("profiles").update({
      start_date: startDate,
      full_name: fullName || null,
    }).eq("id", created.user.id);

    return new Response(JSON.stringify({ ok: true, id: created.user.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
