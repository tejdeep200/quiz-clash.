# Quiz Clash

**Think fast. Clash harder.** A free browser trivia arcade: choose your specialty in Solo Sprint, or face twelve mixed questions and an increasingly short clock in Clash Mode. Build a streak, unlock a 4× combo, and chase your personal best.

[Play Quiz Clash](https://tejdeep200.github.io/quiz-clash./)

## Features

- 108 original fixed-answer questions across six categories and three difficulties.
- Six-question Solo Sprint and twelve-question Clash Mode with escalating time pressure.
- Speed bonuses, streak bonuses, 4× multipliers, accuracy ranks, and shareable results.
- Device-local top-ten leaderboard, optional synthesized audio, and keyboard or touch controls.
- Responsive neon design, bundled licensed fonts, reduced-motion support, and no login or paid API.

## Run and validate

Requires Node.js 22 or newer.

```sh
npm ci
npm start
npm run check
npm test
npm run build
npm run test:browser
```

The local game serves at `http://localhost:3000`. Browser tests use installed Microsoft Edge locally. On Linux CI they use Playwright Chromium; run `npx playwright install --with-deps chromium` first. The test server uses port 4317; set `TEST_URL` to test another running server or the deployed URL (include its trailing slash).

The optional static build is `dist/`; it excludes the multiplayer server. GitHub Actions runs checks, solo and multiplayer browser tests, and a build on pushes to main. It does not publish to GitHub Pages. The multiplayer deployment uses Render.

## Original multiplayer game

The Node.js/WebSocket room game is available at `http://localhost:3000/multiplayer/` when running `npm start`. It uses the same corrected 108-question bank.

## Render multiplayer deployment

`render.yaml` defines a **free Node Web Service**, built with `npm install` and started with `node server.js`. The service binds to `0.0.0.0` on `process.env.PORT`. `/healthz` provides its health check. With `DEFAULT_GAME=multiplayer`, the root URL opens the multiplayer client; `/index.html` still opens the solo arcade. Rooms use one process's memory and disappear on restarts or redeploys.

To verify the public deployment, run:

```powershell
$env:MULTIPLAYER_URL='https://<actual-service>.onrender.com/'
npm run test:multiplayer
```

The test opens independent desktop and mobile browser contexts, creates a four-letter room, joins with a second name, and plays all ten questions. It checks matching question text, answer choices, timers, updated leaderboards, and final standings. A local pass does not verify a public deployment; run it against the actual Render URL before sharing it.

## Scoring

Correct answers earn 100 base points, up to 100 speed points, and 20 points per previous consecutive correct answer (streak bonus capped at 100). Clash multipliers apply to that total: 1× for streaks 1–3, 2× for 4–6, 3× for 7–9, and 4× for 10+. Incorrect or expired answers earn zero and reset the streak. A monotonic deadline prevents extra time after returning from a background tab. A locked answer cannot score again.

Easy, Medium, and Hard begin with 20, 15, and 12 seconds respectively. Clash reduces the limit by two seconds every three questions, down to six seconds. Final ranks reflect accuracy. Scores stay on the current browser/device; no online leaderboard or score integrity claim is made.

## Handshake handoff

Title: **Quiz Clash**. Description: **A neon trivia arcade where knowledge meets nerve. Master six categories in Solo Sprint, or survive Clash Mode’s shrinking clock, build a 4× combo, and earn your final rank. Free, instant, and playable on any device.**

Stack: HTML, CSS, vanilla JavaScript; Node.js and `ws` for the retained local multiplayer server; Node test runner and Playwright; GitHub Actions and GitHub Pages. Fonts: Barlow Condensed and DM Sans, distributed under their bundled SIL Open Font Licenses in `public/fonts/`. Other artwork is original CSS/SVG.

Muse handles the competition submission. Competition eligibility and judging criteria have not been verified.
