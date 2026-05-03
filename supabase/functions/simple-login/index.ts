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

    // Генерируем magic link и возвращаем hashed_token, который клиент подставит в verifyOtp
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalized,
    });
    if (error || !data?.properties?.hashed_token) {
      return new Response(JSON.stringify({ error: "Не удалось войти. Попробуйте ещё раз." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      token_hash: data.properties.hashed_token,
      email: normalized,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Ошибка сервера" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
