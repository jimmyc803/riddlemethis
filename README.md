# Riddlio

One riddle, three guesses, and a daily play streak. A static website with a compact Start Solving homepage, drawer navigation, daily game, contact page, and light/dark themes. No build step or runtime packages are required.

## Local preview

From this directory:

```sh
python3 -m http.server 4174 --bind 127.0.0.1
```

Open http://127.0.0.1:4174. Use a local server instead of opening HTML files directly, because the game fetches its riddle collection.

## Daily riddles

`riddles.json` contains the original 31 riddles scheduled for December 2025. A riddle explicitly scheduled for the user's local date takes priority. Otherwise, the app chooses a repeatable daily rotation from the existing collection, so missing dates no longer leave the game empty. The game labels those picks as coming from the collection. This does not generate new riddles; existing ones repeat.

To schedule a new riddle, add a date entry:

```json
"2026-10-01": {
  "riddle": "Your riddle text",
  "answer": ["accepted answer", "another accepted answer"],
  "hint": "A helpful clue"
}
```

Include alternate valid answers explicitly. Answer checking ignores capitalization, punctuation, repeated whitespace, and articles, and retains the original simple plural support. It does not use fuzzy matching. Adding entries changes the collection's fallback rotation, so schedule content before the day begins when possible.

## Game behavior

- Three wrong guesses end the game. Empty or repeated equivalent guesses do not consume attempts.
- Guesses, hint visibility, and the win/loss state are stored per date and puzzle in this browser.
- Finishing a game, won or lost, contributes to a **play streak**, matching the original participation-based rule. Streaks cannot increment twice in one day and expire after a missed day.
- An open game checks for a new local date on focus, visibility changes, submission, and every 30 seconds. Calendar-day arithmetic avoids daylight-saving offsets.
- Local storage failures leave the game playable in memory and display a notice that progress will not survive a refresh.
- The original theme preference and dated completion/streak storage can be read for compatibility. There is no account or cross-device synchronization.
- Sound is optional and off by default. Results can be copied without revealing the answer; a text fallback is shown if the clipboard API is unavailable.
- A fetch failure disables guessing and provides a retry button.

The contact form retains its existing FormSubmit destination. Actual message delivery depends on that service's configuration; browser checks validate the form without sending a message.

## Files

- `css/site.css`: shared design and responsive themes.
- `js/game-core.js`: pure date, answer, game-state, and streak rules.
- `js/riddleScript.js`: game rendering, persistence, and interactions.
- `js/site.js`: sidebar navigation, theme, help dialog, dates, and storage fallback.

All local URLs are relative and support hosting at a domain root or project subdirectory. The existing analytics configuration remains on the pages that originally used it.

## Checks

Game rules, including all original answer variants:

```sh
node scripts/check-game.cjs
```

Browser checks, with the preview server running and Playwright available in your tooling environment:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright node scripts/check-browser.cjs
```

Optionally set `AXE_MODULE` to the absolute path of `axe-core/axe.min.js` to include automated WCAG A/AA checks in both themes. Screenshots go to a temporary directory printed by the check. Tests block analytics and do not submit the contact form or write to the system clipboard.
