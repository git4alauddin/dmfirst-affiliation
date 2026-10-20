# DM FIRST access portal

An animated affiliate landing page with an integrated registration wrapper and
₹500 deposit-information popup. Plain HTML, CSS, original SVG art, and JavaScript.
No third-party packages, fonts, trackers, or build step.

## Run locally

Use Node.js 20 or later. No install step is required.

```sh
npm start
```

Restart an older server after adding the registration route. Start and stop
the preview manually.

- Full flow: http://127.0.0.1:4173/
- Landing preview without automatic navigation: http://127.0.0.1:4173/?preview=1
- Registration wrapper: http://127.0.0.1:4173/registration.html
- Ticker demo preview: http://127.0.0.1:4173/registration.html?activity=demo
- Popup preview: http://127.0.0.1:4173/deposit-preview.html
- Iframe diagnostics: http://127.0.0.1:4173/iframe-test.html

The server binds only to 127.0.0.1 and serves public files. Use HTTP rather than
file:// so modules and SVG references load correctly. The site also works on a
static host; the wrapper page and assets must be deployed with index.html.

## Visitor flow

1. The progress bar fills for 1.8 seconds and holds at 100% for 0.3 seconds.
2. The lock opens over 0.9 seconds, then navigation opens registration.html.
3. That wrapper embeds the actual DmFirst referral registration page.
4. After a one-second visible-time delay, the ₹500 minimum-deposit popup appears.
5. Closing the popup minimizes it into a circular widget. Selecting the widget
   reopens it.
6. Claim requests wallet recharge inside the same frame.

There is no initial Register/Activate button, return-to-tab step, account detection,
or registration-confirmation screen. The former two-tab flow has been removed.
No account details, passwords, or payment details are collected by this site.

The marketing popup does not confirm that the user registered, activated an
account, or deposited. Registration and payments happen on DmFirst.

The registration header includes an emerald animated capsule with an avatar,
message and highlighted amount, without a pause button or loading bar. The complete box slides in from
the right, holds, moves left while fading out, and leaves a brief gap before the next entry. Its
layout space stays reserved. The normal Quick guide mode
rotates factual registration and deposit information. Explicit ?activity=demo
preview mode shows varied masked names and example deposits/claims, with DEMO
and DEMO ACTIVITY labels included in every visible box. Those transactions are fictional;
there is no live activity feed or transaction detection.

## Compatibility

The external site must function inside an iframe. Its checked response returned
HTTP 200 without X-Frame-Options or Content-Security-Policy, but browser rendering,
login, and wallet compatibility are still unverified. Local tests do not prove
those external flows work.

Open directly is always visible in the wrapper header if the page is blocked or
has trouble signing in. It opens the requested DmFirst URL in a separate tab.
The wrapper does not bypass security headers or proxy third-party content.

## Configuration

Edit js/config.js:

```js
registrationPage: "./registration.html",
popupDelayMs: 1000,
activityIntervalMs: 4000,
minimumDeposit: 500,
depositCurrency: "INR",
sequence: { fillMs: 1800, holdMs: 300, unlockMs: 900 },
```

The full registration and wallet URLs are also configured there. Keep HTML and
no-JavaScript fallback URLs/amounts synchronized when changing configuration.
The minimum amount was supplied by the project owner.

?preview=1 pauses the landing's automatic navigation and displays a link to open
the wrapper. It does not replace the embedded registration page with a mock.

## Accessibility and lifecycle

Reduced-motion preferences disable decorative effects and the minimizing morph.
The floating deposit button gently pulses and bounces 8 px every 4.5 seconds while visible;
hover, keyboard focus, or reduced motion stops its attention effects.
Reduced motion also keeps the header ticker static. Ticker rotation pauses on hover,
keyboard focus, or hidden tabs. Focus the capsule itself to hold it still for reading.
The ticker does not announce each automatic change to screen readers.
Native dialog provides focus containment and Escape dismissal. Hidden-tab timing
pauses, and stalled frames cannot skip the introduction's unlock stage.
Handlers, timers, animation frames, and ghost elements are cleaned up on page exit.

## Structure

```text
index.html                 Three-second lock portal and preview/fallback links
registration.html          Full-page registration iframe, popup, and widget
deposit-preview.html       Standalone popup visual review
iframe-test.html           Separate embedding diagnostics
css/styles.css             Base portal layout
css/animations.css         Introduction effects and reduced motion
css/registration.css       Registration host layout
css/activity-ticker.css    Animated message capsule and responsive layout
css/deposit.css            Popup presentation
css/deposit-widget.css     Circular control and minimizing ghost
js/config.js               Public URLs, timing, amount, currency
js/main.js                 Landing animation and automatic wrapper navigation
js/registration.js         Wrapper startup/lifecycle
js/registration-flow.js    Popup delay and Claim navigation
js/activity-ticker.js      Rotation, hover/focus pauses, and lifecycle
js/activity-content.js     Factual messages and explicitly fictional examples
js/deposit-prompt.js        Reusable popup component
js/deposit-widget.js        Shared minimizing widget
js/animations.js           Visible-time controller and code rain
assets/images/             Original SVG art and icons
future/dashboard-flow.md   Current behavior and integration limits
tools/serve.mjs            Local public-file preview server
tests/                     Timing, popup, and wrapper interaction checks
```

## Validate

```sh
npm run check
npm test
```

Use a real browser to verify third-party registration and login compatibility.
Tests do not create accounts or transfer money.

## Git

IDE settings, dependencies, environment files, and build output are ignored.
Staging, commits, and pushes are performed by the repository owner.
