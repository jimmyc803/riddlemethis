// Pure game rules shared by the browser and the Node regression checks.
(function (root) {
  const DAY_MS = 86400000;
  function localDate(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  function dayNumber(date) {
    const [year, month, day] = date.split("-").map(Number);
    return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
  }
  function normalizeAnswer(answer) {
    return String(answer)
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\b(the|a|an|some)\b/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }
  function isCorrect(answer, accepted) {
    const candidate = normalizeAnswer(answer);
    return (
      !!candidate &&
      accepted.some((value) => {
        const expected = normalizeAnswer(value);
        return candidate === expected || candidate === `${expected}s`;
      })
    );
  }
  function validateLibrary(data) {
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error("Invalid riddle collection");
    const entries = Object.entries(data);
    if (
      !entries.length ||
      entries.some(
        ([date, riddle]) =>
          !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
          !riddle ||
          typeof riddle.riddle !== "string" ||
          !riddle.riddle.trim() ||
          typeof riddle.hint !== "string" ||
          !Array.isArray(riddle.answer) ||
          !riddle.answer.length ||
          riddle.answer.some(
            (answer) => typeof answer !== "string" || !normalizeAnswer(answer),
          ),
      )
    )
      throw new Error("Invalid riddle collection");
    return data;
  }
  function dailyPuzzle(data, date) {
    const dates = Object.keys(data).sort();
    if (!dates.length) throw new Error("Empty collection");
    const scheduled = Object.hasOwn(data, date);
    // Calendar-day arithmetic is stable across daylight-saving changes.
    const offset = dayNumber(date) - dayNumber(dates[0]);
    const sourceDate = scheduled
      ? date
      : dates[((offset % dates.length) + dates.length) % dates.length];
    const riddle = data[sourceDate];
    return {
      ...riddle,
      date,
      sourceDate,
      scheduled,
      id: `${date}:${sourceDate}:${riddle.riddle}`,
    };
  }
  function newGame(puzzle) {
    return {
      date: puzzle.date,
      puzzleId: puzzle.id,
      guesses: [],
      status: "playing",
      hintUsed: false,
    };
  }
  function restoreGame(saved, puzzle) {
    if (
      !saved ||
      saved.date !== puzzle.date ||
      saved.puzzleId !== puzzle.id ||
      !Array.isArray(saved.guesses) ||
      saved.guesses.length > 3 ||
      saved.guesses.some((guess) => typeof guess !== "string") ||
      !["playing", "won", "lost"].includes(saved.status) ||
      (saved.status === "playing" && saved.guesses.length >= 3) ||
      (saved.status === "lost" && saved.guesses.length !== 3) ||
      (saved.status === "won" && !saved.guesses.length)
    )
      return newGame(puzzle);
    return { ...saved, hintUsed: !!saved.hintUsed };
  }
  function submitGuess(state, answer, accepted) {
    if (state.status !== "playing") return { state, message: "finished" };
    if (!normalizeAnswer(answer)) return { state, message: "empty" };
    if (
      state.guesses.some(
        (guess) => normalizeAnswer(guess) === normalizeAnswer(answer),
      )
    )
      return { state, message: "duplicate" };
    const guesses = [...state.guesses, answer.trim()];
    const status = isCorrect(answer, accepted)
      ? "won"
      : guesses.length === 3
        ? "lost"
        : "playing";
    return {
      state: { ...state, guesses, status },
      message: status === "playing" ? "incorrect" : status,
    };
  }
  function visibleStreak(stats, today) {
    const distance = stats?.lastPlayed
      ? dayNumber(today) - dayNumber(stats.lastPlayed)
      : Infinity;
    return (distance === 0 || distance === 1) &&
      Number.isInteger(stats?.streak) &&
      stats.streak > 0
      ? stats.streak
      : 0;
  }
  function recordCompletion(stats, today) {
    if (stats?.lastPlayed === today)
      return {
        lastPlayed: today,
        streak: Math.max(1, visibleStreak(stats, today)),
      };
    return { lastPlayed: today, streak: visibleStreak(stats, today) + 1 };
  }
  const api = {
    localDate,
    dayNumber,
    normalizeAnswer,
    isCorrect,
    validateLibrary,
    dailyPuzzle,
    newGame,
    restoreGame,
    submitGuess,
    visibleStreak,
    recordCompletion,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.RiddlioCore = api;
})(typeof window !== "undefined" ? window : globalThis);
