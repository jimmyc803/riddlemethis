(function () {
  const memory = new Map();
  let available = true;
  const storage = {
    get(key) {
      if (memory.has(key)) return memory.get(key);
      try {
        return localStorage.getItem(key);
      } catch {
        storage.failed();
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
        memory.delete(key);
      } catch {
        memory.set(key, value);
        storage.failed();
      }
    },
    json(key, fallback = null) {
      try {
        return JSON.parse(storage.get(key)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    failed() {
      available = false;
      document.getElementById("storage-note")?.removeAttribute("hidden");
    },
    get available() {
      return available;
    },
  };
  window.RiddlioStorage = storage;
  const switcher = document.getElementById("theme-switch");
  function setTheme(dark, persist = false) {
    document.documentElement.classList.toggle("darkmode", dark);
    switcher.setAttribute(
      "aria-label",
      dark ? "Switch to light theme" : "Switch to dark theme",
    );
    switcher.setAttribute("aria-pressed", String(dark));
    document.getElementById("theme-icon").textContent = dark ? "☼" : "☾";
    document.querySelector('meta[name="theme-color"]').content = dark
      ? "#202232"
      : "#f8f7f2";
    if (persist) storage.set("darkmode", dark ? "active" : "null");
  }
  setTheme(storage.get("darkmode") === "active");
  switcher.addEventListener("click", () =>
    setTheme(!document.documentElement.classList.contains("darkmode"), true),
  );
  const sidebar = document.getElementById("sidebar");
  const openSidebar = document.getElementById("openSidebar");
  openSidebar.addEventListener("click", () => {
    sidebar.showModal();
    openSidebar.setAttribute("aria-expanded", "true");
  });
  sidebar.addEventListener("close", () =>
    openSidebar.setAttribute("aria-expanded", "false"),
  );
  sidebar.addEventListener("click", (event) => {
    if (event.target !== sidebar) return;
    const rect = sidebar.getBoundingClientRect();
    if (
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      sidebar.close();
  });
  const dialog = document.getElementById("help-dialog");
  document.querySelectorAll("[data-help]").forEach((button) =>
    button.addEventListener("click", () => {
      if (sidebar.open) sidebar.close();
      dialog.showModal();
    }),
  );
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
  function updateDates() {
    const now = new Date();
    document.querySelectorAll("[data-today]").forEach((el) => {
      el.dateTime = RiddlioCore.localDate(now);
      el.textContent = new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(now);
    });
  }
  window.RiddlioDates = updateDates;
  updateDates();
})();
