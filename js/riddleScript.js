(function () {
  const core = RiddlioCore;
  const storage = RiddlioStorage;
  const $ = (id) => document.getElementById(id);
  let library, puzzle, state;
  let loading = false;
  let sound = storage.get("riddlio:sound") === "on";
  function stateKey() {
    return `riddlio:game:v2:${puzzle.date}`;
  }
  function save() {
    storage.set(stateKey(), JSON.stringify(state));
  }
  function getStats() {
    return storage.json("riddlio:streak:v2", {
      lastPlayed: storage.get("lastPlayed"),
      streak: Number.parseInt(storage.get("streak"), 10) || 0,
    });
  }
  function updateStreak() {
    const streak = core.visibleStreak(getStats(), core.localDate());
    document.querySelectorAll("[data-streak]").forEach((el) => {
      el.textContent = streak;
    });
    $("streak-message").textContent = streak
      ? "Look at you, keeping curiosity alive."
      : "One small challenge. A habit worth keeping.";
  }
  function feedback(text, success = false) {
    $("result").textContent = text;
    $("result").hidden = !text;
    $("result").classList.toggle("success", success);
  }
  function playSound(correct) {
    if (!sound) return;
    const audio = $(correct ? "correctSound" : "wrongSound");
    audio.currentTime = 0;
    audio.play().catch(() => {
      /* Autoplay restrictions must not interrupt the game. */
    });
  }
  function render() {
    const finished = state.status !== "playing";
    const wrongGuesses =
      state.guesses.length - (state.status === "won" ? 1 : 0);
    const left = 3 - wrongGuesses;
    $("lives").setAttribute("aria-label", `${left} guesses remaining`);
    $("lives").firstElementChild.textContent =
      `${"♥ ".repeat(left)}${"♡ ".repeat(3 - left)}`.trim();
    $("attempt-label").textContent =
      `${left} ${left === 1 ? "guess" : "guesses"} left`;
    $("answer-input").disabled = finished;
    $("submit-btn").disabled = finished;
    $("answer-form").hidden = finished;
    $("hint-btn").disabled = false;
    $("hint").hidden = !state.hintUsed;
    $("hint-btn").setAttribute("aria-expanded", String(state.hintUsed));
    $("hint-btn").innerHTML =
      '<span aria-hidden="true">☼</span> ' +
      (state.hintUsed ? "Hide hint" : "Need a hint?");
    $("completion").hidden = !finished;
    if (finished) {
      const won = state.status === "won";
      $("completion-title").textContent = won
        ? "There’s your aha!"
        : "A good mystery, right?";
      $("completion-symbol").textContent = won ? "✦" : "✧";
      $("completion-message").textContent = won
        ? `You found it in ${state.guesses.length} ${state.guesses.length === 1 ? "guess" : "guesses"}. A little victory for your day.`
        : "Three guesses, one tricky riddle. Come back tomorrow for a fresh start.";
      $("answer-reveal").textContent =
        `The answer: ${puzzle.answer.join(" / ")}.`;
      feedback("");
    }
    updateStreak();
  }
  function restore() {
    let saved = storage.json(stateKey());
    // Keep completed games from the original app when their scheduled date matches.
    if (
      !saved &&
      puzzle.scheduled &&
      storage.get("riddleDone") === puzzle.date
    ) {
      const lost = storage.get("lives") === "0";
      saved = {
        ...core.newGame(puzzle),
        status: lost ? "lost" : "won",
        guesses: lost
          ? [
              "Previous guess 1",
              "Previous guess 2",
              storage.get("lastAnswer") || "Previous guess 3",
            ]
          : [storage.get("lastAnswer") || puzzle.answer[0]],
      };
    }
    state = core.restoreGame(saved, puzzle);
    if (state.status !== "playing")
      storage.set(
        "riddlio:streak:v2",
        JSON.stringify(core.recordCompletion(getStats(), puzzle.date)),
      );
    save();
  }
  function startDay() {
    puzzle = core.dailyPuzzle(library, core.localDate());
    restore();
    $("riddle-text").textContent = puzzle.riddle;
    $("hint").textContent = `A little nudge: ${puzzle.hint}`;
    $("edition-label").textContent = "TODAY’S CHALLENGE";
    $("collection-note").textContent = puzzle.scheduled
      ? ""
      : "Today’s pick is from our riddle collection.";
    $("answer-input").value = "";
    $("share-status").textContent = "";
    feedback("");
    render();
    if (state.status === "playing" && state.guesses.length)
      feedback(
        `${state.guesses.length} ${state.guesses.length === 1 ? "guess" : "guesses"} already tried. Pick up where you left off.`,
      );
    RiddlioDates();
  }
  function refreshDay() {
    if (library && puzzle && puzzle.date !== core.localDate()) {
      startDay();
      feedback("A new day, a new riddle. Your three guesses are ready.", true);
      return true;
    }
    return false;
  }
  async function load() {
    if (loading) return;
    loading = true;
    $("load-error").hidden = true;
    $("answer-input").disabled = true;
    $("submit-btn").disabled = true;
    $("hint-btn").disabled = true;
    $("riddle-text").textContent = "A little mystery is on its way…";
    try {
      const response = await fetch("riddles.json", { cache: "no-cache" });
      if (!response.ok) throw new Error("Unable to load collection");
      library = core.validateLibrary(await response.json());
      startDay();
    } catch {
      $("riddle-text").textContent = "This mystery needs a connection.";
      $("load-error-text").textContent =
        "We couldn’t load the riddle collection. Check your connection and try again.";
      $("load-error").hidden = false;
    } finally {
      loading = false;
    }
  }
  $("answer-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (loading || !puzzle || refreshDay()) return;
    // Read again to respect attempts or completion saved by another open tab.
    state = core.restoreGame(storage.json(stateKey()), puzzle);
    const result = core.submitGuess(
      state,
      $("answer-input").value,
      puzzle.answer,
    );
    state = result.state;
    if (result.message === "empty") {
      feedback("Put your guess into words first. No attempt used.");
      $("answer-input").focus();
      return;
    }
    if (result.message === "duplicate") {
      feedback(
        "You’ve already tried that answer. Try a different idea — no attempt used.",
      );
      $("answer-input").select();
      return;
    }
    save();
    if (result.message === "won" || result.message === "lost") {
      storage.set(
        "riddlio:streak:v2",
        JSON.stringify(core.recordCompletion(getStats(), puzzle.date)),
      );
    }
    render();
    if (result.message === "incorrect") {
      feedback(
        `Not quite. You have ${3 - state.guesses.length} ${state.guesses.length === 2 ? "guess" : "guesses"} left. Try looking at it another way.`,
      );
      $("answer-input").select();
    } else if (state.status !== "playing") {
      $("completion-title").tabIndex = -1;
      $("completion-title").focus();
    }
    if (result.message !== "finished") playSound(state.status === "won");
  });
  $("hint-btn").addEventListener("click", () => {
    if (!puzzle || refreshDay()) return;
    state = core.restoreGame(storage.json(stateKey()), puzzle);
    state.hintUsed = !state.hintUsed;
    save();
    render();
  });
  function renderSound() {
    $("sound-toggle").textContent = sound ? "Sound on" : "Sound off";
    $("sound-toggle").setAttribute("aria-pressed", String(sound));
  }
  $("sound-toggle").addEventListener("click", () => {
    sound = !sound;
    storage.set("riddlio:sound", sound ? "on" : "off");
    renderSound();
  });
  $("share-btn").addEventListener("click", async () => {
    const symbols = state.guesses
      .map((_, index) =>
        state.status === "won" && index === state.guesses.length - 1
          ? "🟨"
          : "⬛",
      )
      .join("");
    const text = `Riddlio · ${puzzle.date}\n${symbols}\n${state.status === "won" ? `Solved in ${state.guesses.length}/3` : "3/3 — back tomorrow!"}\n${new URL("dailyRiddle.html", location.href).href}`;
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      $("share-status").textContent =
        "Copied! Ready to share, without spoiling the answer.";
    } catch {
      $("share-status").textContent = `Copy this result:\n${text}`;
    }
  });
  $("retry-btn").addEventListener("click", load);
  window.addEventListener("focus", refreshDay);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshDay();
  });
  window.addEventListener("storage", (event) => {
    if (!puzzle || refreshDay()) return;
    if (
      event.key === stateKey() ||
      event.key === "riddlio:streak:v2" ||
      event.key === null
    ) {
      state = core.restoreGame(storage.json(stateKey()), puzzle);
      render();
    }
  });
  setInterval(refreshDay, 30000);
  renderSound();
  updateStreak();
  load();
})();
