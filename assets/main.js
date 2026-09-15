(() => {
  "use strict";
  const menuButton = document.getElementById("menu-btn");
  const nav = document.getElementById("navigation");
  const mobile = window.matchMedia("(max-width: 800px)");
  const setMenu = (open, returnFocus = false) => {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    nav.classList.toggle("is-open", open);
    if (returnFocus) menuButton.focus();
  };
  menuButton.addEventListener("click", () =>
    setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
  );
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuButton.getAttribute("aria-expanded") === "true"
    )
      setMenu(false, true);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".header")) setMenu(false);
  });
  document.addEventListener("focusin", (event) => {
    if (!event.target.closest(".header")) setMenu(false);
  });
  mobile.addEventListener("change", () => setMenu(false));

  document.getElementById("year").textContent = String(
    new Date().getFullYear(),
  );
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const tick = () =>
    document.querySelectorAll("[data-clock]").forEach((clock) => {
      clock.textContent = formatter.format(new Date());
    });
  tick();
  window.setInterval(tick, 60000);

  const progress = document.querySelector(".progress");
  let framePending = false;
  const updateProgress = () => {
    const available =
      document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0})`;
    framePending = false;
  };
  const scheduleProgress = () => {
    if (!framePending) {
      framePending = true;
      window.requestAnimationFrame(updateProgress);
    }
  };
  window.addEventListener("scroll", scheduleProgress, { passive: true });
  window.addEventListener("resize", scheduleProgress, { passive: true });
  window.addEventListener("load", scheduleProgress, { once: true });
  updateProgress();

  // Open the capabilities disclosure when following its existing deep link.
  const openLinkedDisclosure = () => {
    const disclosure = document.getElementById(location.hash.slice(1));
    if (disclosure instanceof HTMLDetailsElement) disclosure.open = true;
  };
  window.addEventListener("hashchange", openLinkedDisclosure);
  openLinkedDisclosure();

  // These endpoints exist on Vercel, not on local static servers.
  if (
    location.protocol === "https:" &&
    !["localhost", "127.0.0.1"].includes(location.hostname)
  ) {
    window.va =
      window.va ||
      function () {
        (window.vaq = window.vaq || []).push(arguments);
      };
    window.si =
      window.si ||
      function () {
        (window.siq = window.siq || []).push(arguments);
      };
    for (const src of [
      "/_vercel/insights/script.js",
      "/_vercel/speed-insights/script.js",
    ]) {
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      document.head.appendChild(script);
    }
  }
})();
