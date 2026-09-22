const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const core = require("../js/game-core");
const library = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../riddles.json")),
);
const date = "2026-09-22";
const today = core.dailyPuzzle(library, date);
const base = process.env.BASE_URL || "http://127.0.0.1:4174/";
const output = fs.mkdtempSync(path.join(os.tmpdir(), "riddlio-check-"));
(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      timezoneId: "America/New_York",
    });
    await context.route(/googletagmanager\.com/, (r) => r.abort());
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: async (text) => {
            window.copiedResult = text;
          },
        },
      });
    });
    const page = await context.newPage();
    await page.clock.install({ time: new Date("2026-09-22T16:00:00Z") });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base);
    assert.equal(await page.locator("main a").count(), 1);
    const menuButton = page.getByRole("button", { name: "Open menu" });
    await menuButton.click();
    assert.equal(await page.locator("#sidebar").isVisible(), true);
    assert.equal(await menuButton.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#sidebar").isVisible(), false);
    await page.waitForFunction(() => document.getElementById("openSidebar").getAttribute("aria-expanded") === "false");
    assert.equal(await menuButton.evaluate(el => el === document.activeElement), true);
    await menuButton.click();
    await page.getByRole("link", { name: "Contact Us", exact: true }).click();
    await page.waitForURL("**/contactUs.html");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("link", { name: "Home", exact: true }).click();
    await page.waitForURL("**/index.html");
    await page.screenshot({
      path: path.join(output, "home-desktop.png"),
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "How to play", exact: true })
      .first()
      .click();
    assert.equal(await page.locator("#help-dialog").isVisible(), true);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#help-dialog").isVisible(), false);
    await page.getByRole("link", { name: "Start Solving" }).click();
    const input = page.getByRole("textbox", {
      name: "What’s your best guess?",
    });
    await page.waitForFunction(
      () => !document.getElementById("submit-btn").disabled,
    );
    assert.equal(
      await page.locator("#riddle-text").textContent(),
      today.riddle,
    );
    await page.screenshot({
      path: path.join(output, "game-desktop.png"),
      fullPage: true,
    });
    await input.press("Enter");
    assert.match(
      await page.locator("#result").textContent(),
      /No attempt used/,
    );
    await page.getByRole("button", { name: "Need a hint?" }).click();
    assert.equal(await page.locator("#hint").isVisible(), true);
    await input.fill("wrong one");
    await input.press("Enter");
    assert.match(
      await page.locator("#attempt-label").textContent(),
      /2 guesses/,
    );
    await page.reload();
    await page.waitForFunction(
      () => !document.getElementById("submit-btn").disabled,
    );
    assert.match(
      await page.locator("#attempt-label").textContent(),
      /2 guesses/,
    );
    assert.equal(await page.locator("#hint").isVisible(), true);
    await input.fill("Wrong ONE!");
    await input.press("Enter");
    assert.match(await page.locator("#result").textContent(), /already tried/);
    assert.match(
      await page.locator("#attempt-label").textContent(),
      /2 guesses/,
    );
    await input.fill(`The ${today.answer[0].toUpperCase()}!`);
    await input.press("Enter");
    assert.equal(await page.locator("#completion").isVisible(), true);
    assert.equal(
      await page.locator("#completion-title").textContent(),
      "There’s your aha!",
    );
    assert.equal(await page.locator("[data-streak]").textContent(), "1");
    await page.getByRole("button", { name: "Copy my result" }).click();
    const copied = await page.evaluate(() => window.copiedResult);
    assert.match(copied, /Solved in 2\/3/);
    assert.equal(copied.includes(today.answer[0]), false);
    await page.reload();
    await page.locator("#completion").waitFor({ state: "visible" });
    assert.equal(
      await page.locator("#completion-title").textContent(),
      "There’s your aha!",
    );
    assert.equal(await page.locator("[data-streak]").textContent(), "1");
    await page.screenshot({
      path: path.join(output, "solved-desktop.png"),
      fullPage: true,
    });
    // An open tab transitions to the next local calendar day.
    await page.clock.setSystemTime(new Date("2026-09-23T16:00:00Z"));
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    assert.equal(await input.isEnabled(), true);
    assert.match(
      await page.locator("#attempt-label").textContent(),
      /3 guesses/,
    );
    assert.equal(
      await page.locator("#riddle-text").textContent(),
      core.dailyPuzzle(library, "2026-09-23").riddle,
    );
    for (const answer of ["wrong first", "wrong second", "wrong third"]) {
      await input.fill(answer);
      await input.press("Enter");
    }
    assert.equal(
      await page.locator("#completion-title").textContent(),
      "A good mystery, right?",
    );
    assert.equal(await page.locator("[data-streak]").textContent(), "2");
    await page.reload();
    await page.locator("#completion").waitFor({ state: "visible" });
    assert.equal(
      await page.locator("#completion-title").textContent(),
      "A good mystery, right?",
    );
    assert.equal(await page.locator("[data-streak]").textContent(), "2");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await page.reload();
    assert.equal(
      await page
        .locator("html")
        .evaluate((el) => el.classList.contains("darkmode")),
      true,
    );
    await page.screenshot({
      path: path.join(output, "game-dark.png"),
      fullPage: true,
    });
    // Check all pages and both themes at mobile, tablet, and desktop widths.
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "index.html",
        "dailyRiddle.html",
        "contactUs.html",
      ]) {
        await page.goto(base + route);
        if (route === "dailyRiddle.html")
          await page.waitForFunction(
            () => !document.getElementById("hint-btn").disabled,
          );
        for (const dark of [true, false]) {
          await page.evaluate(
            (dark) =>
              document.documentElement.classList.toggle("darkmode", dark),
            dark,
          );
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            true,
            `${route}: overflow at ${width}px, dark=${dark}`,
          );
        }
        if (width === 390)
          await page.screenshot({
            path: path.join(output, route.replace(".html", "") + "-mobile.png"),
            fullPage: true,
          });
        if (process.env.AXE_MODULE && width === 390) {
          await page.addScriptTag({ path: process.env.AXE_MODULE });
          for (const dark of [false, true]) {
            await page.evaluate(
              (dark) =>
                document.documentElement.classList.toggle("darkmode", dark),
              dark,
            );
            const violations = await page.evaluate(async () =>
              (
                await axe.run(document, {
                  runOnly: {
                    type: "tag",
                    values: ["wcag2a", "wcag2aa", "wcag21aa"],
                  },
                })
              ).violations.map((v) => ({
                id: v.id,
                nodes: v.nodes.map((n) => ({
                  target: n.target,
                  summary: n.failureSummary,
                })),
              })),
            );
            assert.deepEqual(
              violations,
              [],
              `${route}: accessibility, dark=${dark}`,
            );
          }
        }
      }
    }
    await page.goto(`${base}contactUs.html`);
    assert.equal(
      await page
        .locator("form#contact-form")
        .evaluate((f) => f.checkValidity()),
      false,
    );
    await page.getByLabel("Your name").fill("Local Test");
    await page.getByLabel("Email address").fill("test@example.com");
    await page
      .getByLabel("Your message")
      .fill("Local validation only; do not send.");
    assert.equal(
      await page
        .locator("form#contact-form")
        .evaluate((f) => f.checkValidity()),
      true,
    );
    assert.equal(
      await page.locator("form#contact-form").getAttribute("action"),
      "https://formsubmit.co/official.riddlio@gmail.com",
    );
    // Explicit collection-load failure and recovery.
    await page.route("**/riddles.json", (r) =>
      r.fulfill({ status: 500, body: "Failed" }),
    );
    await page.goto(`${base}dailyRiddle.html`);
    await page.locator("#load-error").waitFor({ state: "visible" });
    assert.equal(await page.locator("#submit-btn").isDisabled(), true);
    await page.unroute("**/riddles.json");
    await page.getByRole("button", { name: "Try again" }).click();
    await page.waitForFunction(
      () => !document.getElementById("hint-btn").disabled,
    );
    assert.equal(await page.locator("#load-error").isVisible(), false);
    assert.deepEqual(errors, [], "Uncaught browser errors");
    // Playability when local storage is unavailable.
    const blocked = await browser.newContext({
      timezoneId: "America/New_York",
    });
    await blocked.route(/googletagmanager\.com/, (r) => r.abort());
    await blocked.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new DOMException("Blocked");
      };
      Storage.prototype.setItem = () => {
        throw new DOMException("Blocked");
      };
    });
    const limited = await blocked.newPage();
    await limited.clock.install({ time: new Date("2026-09-22T16:00:00Z") });
    await limited.goto(`${base}dailyRiddle.html`);
    await limited.waitForFunction(
      () => !document.getElementById("submit-btn").disabled,
    );
    assert.equal(await limited.locator("#storage-note").isVisible(), true);
    await limited.locator("#answer-input").fill("wrong guess");
    await limited.locator("#answer-input").press("Enter");
    assert.match(
      await limited.locator("#attempt-label").textContent(),
      /2 guesses/,
    );
    await limited.locator("#answer-input").fill(today.answer[0]);
    await limited.locator("#answer-input").press("Enter");
    assert.equal(
      await limited.locator("#completion-title").textContent(),
      "There’s your aha!",
    );
    await blocked.close();
    await context.close();
    console.log(
      "PASS: minimal homepage, sidebar navigation, guesses, hints, reload persistence, win/loss states, streaks, midnight reset, theme, sharing, error recovery, storage fallback, contact validation, and responsive layouts.",
    );
    console.log(`Screenshots: ${output}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
