/**
 * DICE & more — booking notification proxy (Cloudflare Worker)
 * ---------------------------------------------------------------
 * This is the piece that keeps your Telegram bot token OFF the
 * public website. Deploy it once; the frontend never sees the
 * token, only this Worker's URL.
 *
 * SETUP
 * 1. Sign in at https://dash.cloudflare.com -> Workers & Pages.
 * 2. Create a new Worker, paste this file in as its code.
 * 3. Under Settings > Variables, add two ENCRYPTED variables:
 *      TELEGRAM_BOT_TOKEN   (from @BotFather)
 *      TELEGRAM_CHAT_ID     (from @userinfobot, or your group's id)
 * 4. Under Settings > Triggers, note the worker's URL, e.g.
 *      https://dice-booking-proxy.yourname.workers.dev
 * 5. Paste that URL into FORM_ENDPOINT near the top of script.js.
 * 6. Replace ALLOWED_ORIGIN below with your real site's origin
 *    so only your site can call this Worker.
 */

const ALLOWED_ORIGIN = "https://www.diceandmore.com";

export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    let payload;

    try {
      payload = await request.json();
    } catch (err) {
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
    }

    const text = (payload.message || "").toString().slice(0, 3000);

    if (!text) {
      return new Response("Missing message", { status: 400, headers: corsHeaders });
    }

    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const tgResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
      }),
    });

    if (!tgResponse.ok) {
      return new Response("Telegram request failed", { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  },
};
