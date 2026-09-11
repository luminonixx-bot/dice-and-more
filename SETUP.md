# DICE & more — Setup Guide

This covers everything that needs a one-time decision or a
few minutes of setup after you upload these files. Most of the
site works immediately; a handful of things are placeholders on
purpose because they need *your* real accounts/domain.

## 1. Domain & hosting

Replace `https://www.diceandmore.com` with your real domain in:
- `index.html`, `privacy.html`, `terms.html` (canonical + Open Graph tags)
- `robots.txt`, `sitemap.xml`
- `serverless/telegram-proxy/*.js` (`ALLOWED_ORIGIN`)

Pick ONE hosting config to keep (delete the other two — they're
harmless if left, but only one will actually be read by your host):
- **Netlify** → keep `_redirects`
- **Vercel** → keep `vercel.json`
- **Apache / cPanel / shared hosting** → keep `.htaccess`

All three force HTTPS and serve `404.html` for missing pages.
Cloudflare Pages / most modern hosts force HTTPS automatically —
check your host's dashboard for a "Force HTTPS" or "Always use
HTTPS" toggle as a first step either way.

## 2. Booking notifications (no more exposed secrets)

The old version put your Telegram bot token directly in
`script.js`, visible to anyone who viewed the page source. That's
fixed: `script.js` now calls a `FORM_ENDPOINT` you control, and
the token lives only on the server side.

1. Open `serverless/telegram-proxy/` — pick `cloudflare-worker.js`
   (free, ~5 min, recommended) or `vercel-function.js`.
2. Follow the setup comments at the top of whichever file you pick.
3. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as **environment
   variables** on that platform — never paste them into a file that
   goes on the website.
4. Copy the deployed function's URL.
5. Open `script.js`, find:
   ```js
   const FORM_ENDPOINT = "YOUR_SERVERLESS_ENDPOINT_URL_HERE";
   ```
   and paste your URL in. Until you do this, the booking form
   shows a friendly "almost ready" message instead of failing.

## 3. Analytics (Google Analytics 4)

Analytics only loads after a visitor accepts the cookie banner —
nothing loads before that, by design.

1. Create a GA4 property at https://analytics.google.com and copy
   your Measurement ID (looks like `G-ABC1234XYZ`).
2. In `index.html`, `privacy.html`, `terms.html` and `404.html`,
   replace `G-XXXXXXXXXX` in `<html data-ga-id="G-XXXXXXXXXX">`
   with your real ID.

## 4. Favicon & social preview image

Already generated and included, using your brand colors:
- `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`,
  `android-chrome-192.png`, `android-chrome-512.png`
- `images/og-image.jpg` — shown when the site is shared on
  WhatsApp, Facebook, Twitter/X, iMessage, etc.

These use a placeholder "D&" monogram. Swap them for your real
logo mark whenever you have one — keep the same filenames and
sizes and everything will just work.

## 5. Images — compression & real photos

No image files were included in the upload, so the `<img>` tags
still point at filenames like `images/events-hall.jpg` that don't
exist yet on disk. When you add the real photos:

- **Compress before uploading.** Aim for under ~200KB per photo.
  Free tools: https://squoosh.app (drag and drop, no install) or
  https://tinypng.com. Export as JPEG (quality ~75–85%) for
  photos, or WebP for smaller file sizes if your host supports it.
- **Match the display size.** A photo shown at 800px wide doesn't
  need to be 4000px wide — resize before compressing.
- All images already have `loading="lazy"` (except the logo,
  which loads eagerly since it's above the fold) and descriptive
  `alt` text, which also helps page-speed and accessibility scores.

## 6. Page speed — what's already done vs. what's on you

Already in place: deferred JS, lazy-loaded images, font
`preconnect`, gzip/caching headers (Apache config), browser
caching headers (Vercel config), minimal render-blocking CSS.

Once real (compressed) images are added, run your live URL
through https://pagespeed.web.dev for a real score — this can't
be measured meaningfully until the site is deployed with real
photos.

## 7. Things flagged for you to double check

- `Accra, Ghana` is a placeholder location — replace with your
  real business address in `index.html`'s contact section (search
  for "TODO: replace with your real address").
- The Google Maps link currently searches "DICE and more" by
  name — once you have a verified Google Business listing, swap
  it for that listing's real Maps link.
- Legal pages (`privacy.html`, `terms.html`) are solid generic
  starting points but aren't a substitute for a lawyer's review,
  especially if you process payments online or trade outside Ghana.
