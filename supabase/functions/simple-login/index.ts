import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email } = await req.json();
    const normalized = String(email ?? "").trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return new Response(JSON.stringify({ error: "Введите корректный e-mail." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Проверяем, что пользователь добавлен админом (есть в profiles)
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", normalized)
      .maybeSingle();

    if (!profile) {
      return new Response(JSON.stringify({
        error: "Этот e-mail не найден в списке участниц. Напишите куратору.",
      }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Генерируем одноразовый токен и подтверждаем его прямо на сервере.
    // Так GitHub Pages не зависит от ссылок, redirect URL и особенностей мобильного браузера.
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalized,
    });
    if (error || !data?.properties?.hashed_token) {
      return new Response(JSON.stringify({ error: "Не удалось войти. Попробуйте ещё раз." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data: verified, error: verifyError } = await authClient.auth.verifyOtp({
      type: "magiclink",
      token_hash: data.properties.hashed_token,
    });

    if (verifyError || !verified.session) {
      return new Response(JSON.stringify({ error: "Не удалось войти. Попробуйте ещё раз." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      access_token: verified.session.access_token,
      refresh_token: verified.session.refresh_token,
      email: normalized,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Ошибка сервера" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
