/**
 * DICE & more — booking notification proxy (Vercel/Netlify function)
 * ---------------------------------------------------------------
 * Alternative to the Cloudflare Worker, if you'd rather deploy on
 * Vercel or Netlify. Same idea: the Telegram token lives only in
 * this function's environment variables, never in the frontend.
 *
 * VERCEL SETUP
 * 1. Put this file at /api/booking.js in a Vercel project.
 * 2. In Vercel Project Settings > Environment Variables, add:
 *      TELEGRAM_BOT_TOKEN
 *      TELEGRAM_CHAT_ID
 * 3. Deploy. Your endpoint will be:
 *      https://your-project.vercel.app/api/booking
 * 4. Paste that URL into FORM_ENDPOINT in script.js.
 *
 * NETLIFY SETUP
 * Same file works as a Netlify Function if placed at
 * /netlify/functions/booking.js — Netlify's handler signature is
 * slightly different, see https://docs.netlify.com/functions/overview/
 */

const ALLOWED_ORIGIN = "https://www.diceandmore.com";

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const text = (req.body && req.body.message ? String(req.body.message) : "").slice(0, 3000);

  if (!text) {
    return res.status(400).send("Missing message");
  }

  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const tgResponse = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text,
    }),
  });

  if (!tgResponse.ok) {
    return res.status(502).send("Telegram request failed");
  }

  return res.status(200).json({ ok: true });

}
