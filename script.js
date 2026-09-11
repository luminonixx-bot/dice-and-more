
/* =========================================================
   DICE & MORE
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   BOOKING SYSTEM CONFIG
   ---------------------------------------------------------
   Bookings are sent to a small serverless function you
   deploy (Cloudflare Worker, Vercel/Netlify function, etc.)
   which holds the Telegram bot token on the SERVER SIDE.
   No secret ever ships in this file or in the page source.

   SETUP:

   1. Deploy the example proxy in /serverless/telegram-proxy
      (see SETUP.md) to Cloudflare Workers, Vercel or Netlify
      Functions. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
      as encrypted environment variables on that platform —
      not in this repository.

   2. Copy the URL you get after deploying and paste it below
      as FORM_ENDPOINT.

   Until FORM_ENDPOINT is set, the form will show a friendly
   "not fully set up yet" message instead of failing silently.
========================================================= */

const FORM_ENDPOINT = "/api/booking";

/* Simple spam guards (used lower down):
   - a honeypot field real users never see or fill in
   - a minimum time-on-form so instant bot submits are blocked */
const MIN_SUBMIT_SECONDS = 3;


/* =========================================================
   WAIT FOR PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


  /* =======================================================
     MOBILE NAVIGATION
  ======================================================= */

  const menuBtn =
    document.getElementById("menuBtn");

  const navigation =
    document.getElementById("navigation");


  if (menuBtn && navigation) {

    menuBtn.addEventListener("click", () => {

      const isOpen =
        navigation.classList.toggle("open");

      menuBtn.classList.toggle(
        "active",
        isOpen
      );

      menuBtn.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    });


    /* Close menu after selecting a page section */

    const navigationLinks =
      navigation.querySelectorAll("a");

    navigationLinks.forEach((link) => {

      link.addEventListener("click", () => {

        navigation.classList.remove("open");

        menuBtn.classList.remove("active");

        menuBtn.setAttribute(
          "aria-expanded",
          "false"
        );

      });

    });

  }


  /* =======================================================
     HEADER SCROLL EFFECT
  ======================================================= */

  const header =
    document.querySelector(".header");


  function updateHeader() {

    if (!header) {
      return;
    }

    if (window.scrollY > 30) {

      header.classList.add("scrolled");

    } else {

      header.classList.remove("scrolled");

    }

  }


  updateHeader();

  window.addEventListener(
    "scroll",
    updateHeader
  );


  /* =======================================================
     SMOOTH INTERNAL LINKS
  ======================================================= */

  const internalLinks =
    document.querySelectorAll(
      'a[href^="#"]'
    );


  internalLinks.forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {

        const targetId =
          link.getAttribute("href");


        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }


        const target =
          document.querySelector(
            targetId
          );


        if (!target) {
          return;
        }


        event.preventDefault();


        const headerHeight =
          header
            ? header.offsetHeight
            : 0;


        const targetPosition =
          target.getBoundingClientRect().top +
          window.scrollY -
          headerHeight;


        window.scrollTo({

          top: targetPosition,

          behavior: "smooth"

        });

      }
    );

  });


  /* =======================================================
     CURRENT YEAR
  ======================================================= */

  const year =
    document.getElementById("year");


  if (year) {

    year.textContent =
      new Date().getFullYear();

  }


  /* =======================================================
     CLOSE MENU WHEN CLICKING OUTSIDE
  ======================================================= */

  document.addEventListener(
    "click",
    (event) => {

      if (
        !navigation ||
        !menuBtn
      ) {
        return;
      }


      const clickedInsideMenu =
        navigation.contains(
          event.target
        );


      const clickedMenuButton =
        menuBtn.contains(
          event.target
        );


      if (
        !clickedInsideMenu &&
        !clickedMenuButton &&
        navigation.classList.contains("open")
      ) {

        navigation.classList.remove("open");

        menuBtn.classList.remove("active");

        menuBtn.setAttribute(
          "aria-expanded",
          "false"
        );

      }

    }
  );


  /* =======================================================
     BOOKING SYSTEM
  ======================================================= */

  const bookingModal =
    document.getElementById("bookingModal");

  const bookingOverlay =
    document.getElementById("bookingOverlay");

  const bookingClose =
    document.getElementById("bookingClose");

  const bookingForm =
    document.getElementById("bookingForm");

  const bookingFormWrap =
    document.getElementById("bookingFormWrap");

  const bookingSuccess =
    document.getElementById("bookingSuccess");

  const bookingSubmit =
    document.getElementById("bookingSubmit");

  const bookingError =
    document.getElementById("bookingError");

  const bookingDone =
    document.getElementById("bookingDone");

  const bookServiceSelect =
    document.getElementById("bookService");

  const bookDateInput =
    document.getElementById("bookDate");

  if (bookDateInput) {
    const today = new Date();
    const iso = today.toISOString().split("T")[0];
    bookDateInput.setAttribute("min", iso);
  }


  let bookingScrollY = 0;


  function lockPageScroll() {

    bookingScrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${bookingScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

  }


  function unlockPageScroll() {

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    window.scrollTo(0, bookingScrollY);

  }


  function openBooking(presetService) {

    if (!bookingModal) {
      return;
    }

    if (presetService && bookServiceSelect) {

      const match = Array.from(bookServiceSelect.options)
        .find((opt) => opt.value === presetService);

      if (match) {
        bookServiceSelect.value = presetService;
      }

    }

    bookingModal.classList.add("open");

    bookingModal.setAttribute("aria-hidden", "false");

    bookingModal.dataset.openedAt = String(Date.now());

    lockPageScroll();

    /* Move focus into the dialog for keyboard/screen-reader users */
    window.setTimeout(() => {
      const firstField = document.getElementById("bookName");
      if (firstField) {
        firstField.focus();
      }
    }, 50);

  }


  function closeBooking() {

    if (!bookingModal) {
      return;
    }

    bookingModal.classList.remove("open");

    bookingModal.setAttribute("aria-hidden", "true");

    unlockPageScroll();

  }


  function resetBookingForm() {

    if (bookingForm) {
      bookingForm.reset();
    }

    if (bookingFormWrap) {
      bookingFormWrap.hidden = false;
    }

    if (bookingSuccess) {
      bookingSuccess.hidden = true;
    }

    if (bookingError) {
      bookingError.classList.remove("show");
      bookingError.textContent = "";
    }

    if (bookingSubmit) {
      bookingSubmit.disabled = false;
      bookingSubmit.textContent = "Book Now";
    }

  }


  /* Open from any of the site's "Book Now" entry points:
     the nav pill, the hero button and the mid-page CTA band.
     Keeping one consistent action across the page gives the
     site a single, clear call to action. */

  const bookTriggerIds = ["navBookBtn", "heroBookBtn", "ctaBookBtn"];

  bookTriggerIds.forEach((id) => {

    const btn = document.getElementById(id);

    if (!btn) {
      return;
    }

    btn.addEventListener("click", (event) => {

      event.preventDefault();

      openBooking();

    });

  });


  /* Open from a service card, pre-filling its service */

  document.querySelectorAll(".service[data-service]")
    .forEach((card) => {

      card.addEventListener("click", () => {

        openBooking(card.dataset.service);

      });

    });


  /* Open from a treatment tag, pre-filling its service */

  document.querySelectorAll(".tag[data-service]")
    .forEach((tag) => {

      tag.addEventListener("click", () => {

        openBooking(tag.dataset.service);

      });

    });


  /* Close interactions */

  if (bookingClose) {
    bookingClose.addEventListener("click", closeBooking);
  }

  if (bookingOverlay) {
    bookingOverlay.addEventListener("click", closeBooking);
  }

  document.addEventListener("keydown", (event) => {

    if (
      event.key === "Escape" &&
      bookingModal &&
      bookingModal.classList.contains("open")
    ) {
      closeBooking();
    }

  });

  if (bookingDone) {

    bookingDone.addEventListener("click", () => {

      resetBookingForm();

      closeBooking();

    });

  }


  /* Build the notification message */

  function buildBookingMessage(data) {

    const lines = [
      "📅 NEW BOOKING — DICE & more",
      "",
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Service: ${data.service}`,
    ];

    if (data.date) {
      lines.push(`Preferred date: ${data.date}`);
    }

    if (data.note) {
      lines.push(`Notes: ${data.note}`);
    }

    return lines.join("\n");

  }


  /* Sends the booking to YOUR serverless proxy (never to
     Telegram directly), so no secret ever lives in this file.
     See the FORM_ENDPOINT config note near the top. */

  async function sendBookingToServer(data, text) {

    if (
      !FORM_ENDPOINT ||
      FORM_ENDPOINT === "YOUR_SERVERLESS_ENDPOINT_URL_HERE"
    ) {
      throw new Error("missing-config");
    }

    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        message: text,
      }),
    });

    if (!response.ok) {
      throw new Error("request-failed");
    }

  }


  /* -------------------------------------------------------
     VALIDATION
     A small set of extra checks on top of the browser's
     built-in required/type validation, with inline messages
     next to each field (not just the native tooltip).
  ------------------------------------------------------- */

  const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;

  function setFieldError(fieldEl, message) {

    if (!fieldEl) {
      return;
    }

    const wrap = fieldEl.closest(".booking-field");

    if (!wrap) {
      return;
    }

    wrap.classList.add("field-invalid");

    let msgEl = wrap.querySelector(".field-msg");

    if (!msgEl) {
      msgEl = document.createElement("small");
      msgEl.className = "field-msg";
      msgEl.setAttribute("role", "alert");
      wrap.appendChild(msgEl);
    }

    msgEl.textContent = message;

  }

  function clearFieldError(fieldEl) {

    if (!fieldEl) {
      return;
    }

    const wrap = fieldEl.closest(".booking-field");

    if (!wrap) {
      return;
    }

    wrap.classList.remove("field-invalid");

    const msgEl = wrap.querySelector(".field-msg");

    if (msgEl) {
      msgEl.textContent = "";
    }

  }

  function clearAllFieldErrors() {

    if (!bookingForm) {
      return;
    }

    bookingForm.querySelectorAll(".booking-field").forEach((wrap) => {
      wrap.classList.remove("field-invalid");
      const msgEl = wrap.querySelector(".field-msg");
      if (msgEl) {
        msgEl.textContent = "";
      }
    });

  }

  function validateBookingForm(data) {

    let firstInvalid = null;

    clearAllFieldErrors();

    const nameField = document.getElementById("bookName");
    if (!data.name || data.name.length < 2) {
      setFieldError(nameField, "Please enter your full name.");
      firstInvalid = firstInvalid || nameField;
    }

    const phoneField = document.getElementById("bookPhone");
    if (!data.phone || !PHONE_PATTERN.test(data.phone)) {
      setFieldError(phoneField, "Please enter a valid phone number.");
      firstInvalid = firstInvalid || phoneField;
    }

    const serviceField = document.getElementById("bookService");
    if (!data.service) {
      setFieldError(serviceField, "Please select a service.");
      firstInvalid = firstInvalid || serviceField;
    }

    return firstInvalid;

  }


  /* -------------------------------------------------------
     SPAM PROTECTION
     1) Honeypot: a field real visitors never see/fill in.
        If it has a value, the submitter is (almost
        certainly) a bot — fail silently, no request sent.
     2) Time-trap: forms filled in under MIN_SUBMIT_SECONDS
        are treated the same way, since real users need at
        least a couple of seconds to type.
  ------------------------------------------------------- */

  function isLikelySpam(formData) {

    const honeypotValue = (formData.get("company_website") || "").trim();

    if (honeypotValue) {
      return true;
    }

    const openedAt = Number(bookingModal ? bookingModal.dataset.openedAt : 0);

    if (openedAt) {
      const elapsedSeconds = (Date.now() - openedAt) / 1000;
      if (elapsedSeconds < MIN_SUBMIT_SECONDS) {
        return true;
      }
    }

    return false;

  }


  if (bookingForm) {

    /* Clear a field's error as soon as the person edits it */
    bookingForm.querySelectorAll("input, select, textarea").forEach((el) => {
      el.addEventListener("input", () => clearFieldError(el));
      el.addEventListener("change", () => clearFieldError(el));
    });

    bookingForm.addEventListener("submit", async (event) => {

      event.preventDefault();

      const formData = new FormData(bookingForm);

      const data = {
        name: (formData.get("name") || "").trim(),
        phone: (formData.get("phone") || "").trim(),
        service: (formData.get("service") || "").trim(),
        date: (formData.get("date") || "").trim(),
        note: (formData.get("note") || "").trim(),
      };

      if (bookingError) {
        bookingError.classList.remove("show");
        bookingError.textContent = "";
      }

      /* Quietly drop likely-bot submissions without alarming
         a real user — just behave as if it succeeded. */
      if (isLikelySpam(formData)) {

        if (bookingFormWrap) {
          bookingFormWrap.hidden = true;
        }

        if (bookingSuccess) {
          bookingSuccess.hidden = false;
        }

        return;

      }

      const firstInvalid = validateBookingForm(data);

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      if (bookingSubmit) {
        bookingSubmit.disabled = true;
        bookingSubmit.textContent = "Sending...";
      }

      try {

        const message = buildBookingMessage(data);

        await sendBookingToServer(data, message);

        if (bookingFormWrap) {
          bookingFormWrap.hidden = true;
        }

        if (bookingSuccess) {
          bookingSuccess.hidden = false;
        }

      } catch (error) {

        if (bookingSubmit) {
          bookingSubmit.disabled = false;
          bookingSubmit.textContent = "Book Now";
        }

        if (bookingError) {

          bookingError.textContent =
            error.message === "missing-config"
              ? "Booking is almost ready — the connection just needs to be set up. Please call or WhatsApp us directly for now."
              : "Something went wrong sending your booking. Please try again, or call/WhatsApp us directly.";

          bookingError.classList.add("show");

        }

      }

    });

  }


  /* =======================================================
     COOKIE CONSENT BANNER
     Analytics only loads AFTER the person accepts. Choice
     is remembered in localStorage so it only shows once.
  ======================================================= */

  const COOKIE_CONSENT_KEY = "diceandmore_cookie_consent";

  const cookieBanner = document.getElementById("cookieBanner");
  const cookieAccept = document.getElementById("cookieAccept");
  const cookieDecline = document.getElementById("cookieDecline");
  const whatsappBtn = document.querySelector(".whatsapp");

  function getStoredConsent() {
    try {
      return window.localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeConsent(value) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch (e) {
      /* localStorage unavailable (e.g. private mode) — ignore */
    }
  }

  function loadAnalytics() {

    /* Replace G-XXXXXXXXXX in index.html with your real GA4
       Measurement ID. Nothing loads until consent is given. */

    if (window.__analyticsLoaded) {
      return;
    }

    const gaId = document.documentElement.dataset.gaId;

    if (!gaId || gaId.indexOf("G-XXXX") === 0) {
      return;
    }

    window.__analyticsLoaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", gaId, { anonymize_ip: true });

  }

  function hideCookieBanner() {
    if (cookieBanner) {
      cookieBanner.classList.remove("show");
    }
    if (whatsappBtn) {
      whatsappBtn.style.display = "";
    }
  }

  function showCookieBanner() {
    if (cookieBanner) {
      cookieBanner.classList.add("show");
    }
    /* avoid the two floating elements overlapping on mobile */
    if (whatsappBtn && window.innerWidth <= 480) {
      whatsappBtn.style.display = "none";
    }
  }

  const existingConsent = getStoredConsent();

  if (existingConsent === "accepted") {
    loadAnalytics();
  } else if (existingConsent !== "declined") {
    showCookieBanner();
  }

  if (cookieAccept) {
    cookieAccept.addEventListener("click", () => {
      storeConsent("accepted");
      loadAnalytics();
      hideCookieBanner();
    });
  }

  if (cookieDecline) {
    cookieDecline.addEventListener("click", () => {
      storeConsent("declined");
      hideCookieBanner();
    });
  }


});

