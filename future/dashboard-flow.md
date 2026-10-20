# Integrated registration wrapper and deposit promotion

## Active flow

1. The landing page runs its existing three-second lock sequence.
2. Once the bar reaches 100% and the lock finishes opening, the page automatically
   navigates to our registration.html wrapper in the same tab.
3. The wrapper loads DmFirst's actual registration URL in a full-page iframe,
   preserving invitation code 93458117528.
4. A configurable marketing delay (currently 1000 ms of visible time) opens the
   neon-green ₹500 minimum-deposit popup above the embedded registration page.
5. Closing with the close control, Escape, or backdrop animates the popup toward
   a circular deposit-information widget at the lower right. Reduced-motion users
   see the widget directly. Selecting it reopens the popup.
6. Claim requests DmFirst wallet recharge in the same iframe. The wrapper and
   widget remain part of our outer page. Closing or opening the popup alone
   does not navigate to wallet recharge.

The previous two-tab registration/return screens and local session-confirmation
logic have been removed. Visitors do not need to return to our landing page or
select I've registered.

## Trigger and navigation rules

The popup delay starts when the wrapper's JavaScript initializes and pauses while
the wrapper is hidden. It does not wait for or infer registration completion.
Opening Deposit details manually cancels the pending automatic popup so it does
not unexpectedly reopen after dismissal.

The host does not inspect the embedded document, fields, account numbers, login
state, balance, dashboard route, or deposit status. There is no registration
callback, account polling, credential proxy, or payment processing on our host.

Claim is a real wallet URL with a click handler for same-frame navigation.
Modified clicks keep normal browser link behavior. If JavaScript is unavailable,
the link can navigate directly. A requested wallet URL does not prove the wallet
rendered, that registration succeeded, or that a deposit was made.

## Destinations and configuration

Configured in js/config.js:

- registrationPage: ./registration.html
- registerUrl: https://www.dmfirst0.com/#/register?invitationCode=93458117528
- depositUrl: https://www.dmfirst0.com/#/wallet/Recharge
- popupDelayMs: 1000
- activityIntervalMs: 4000
- minimumDeposit: 500
- depositCurrency: INR

The introduction keeps fillMs 1800, holdMs 300, and unlockMs 900: three seconds
before navigating, plus a paint opportunity. Keep the unlock interval longer
than the 0.65-second CSS shackle transition.

The ₹500 minimum was supplied by the project owner. Claim does not promise a
reward or record payment/activation status. Any additional offer or verification
claims require supporting content before they are added.

## Popup and shared widget

- registration.html contains the host page and native dialog markup.
- js/registration-flow.js coordinates the delay and Claim navigation.
- js/deposit-prompt.js applies the configured amount and wallet URL.
- js/deposit-widget.js owns opening, dismissal, minimization, and cleanup.
- css/deposit.css and css/deposit-widget.css provide the themed presentation.
- Native dialog handles modal focus and Escape dismissal.

The circular control is labeled as deposit details rather than live support.
While visible, it has a soft 3.6-second glow pulse and a bounce every 4.5 seconds,
rising 8 px with a smaller 3 px follow-up hop. Hover or keyboard focus stops both effects, and reduced
motion disables them. Opening the popup hides the control as before; the
attention effects do not reopen the popup or change its destination.

## Registration top-bar ticker

The header contains a neon-green capsule inspired by the supplied reference,
with an original layout: badge, circular initials/symbol avatar, persistent mode
label, message, and highlighted value. There is no pause button or loading bar.
The entire capsule slides in from the right and fades into view, stays visible,
then moves left and fades away before the next capsule appears.
The default 4000 ms active-time cycle has
a 360 ms entrance, a readable hold, a 360 ms exit, and a 240 ms empty interval.
Its header space stays reserved throughout so the iframe does not jump.

Normal visits use QUICK GUIDE and rotate factual information about the referral,
configured minimum deposit, wallet recharge, and deposit details. No user activity
or completed payments are inferred from this information.

The explicit registration.html?activity=demo preview displays masked fictional
names and varied deposit/claim amounts. Each capsule includes DEMO and DEMO
ACTIVITY labels whenever it is visible; accessible text also identifies the examples as fictional.
There is no genuine activity source connected. Real transaction social proof
would need an authorized source before replacing these preview examples.

Rotation pauses on pointer hover, keyboard focus, and hidden tabs.
The capsule itself is keyboard-focusable so visitors can hold it still to read.
Pausing makes the whole capsule visible, including during its exit or empty gap.
Reduced-motion users see a static first entry.
The capsule uses a separate row on narrower screens so the external page retains
the remaining viewport height. Ticker state does not affect popup or Claim logic.

## Compatibility and fallback

DmFirst must allow its page to work embedded. A public HTTPS GET on 20 October
2026 returned HTTP 200 without X-Frame-Options or a Content-Security-Policy header.
That response did not advertise those framing restrictions, but actual rendering,
registration, login, and wallet navigation remain unverified in a browser.

No connected browser was available for rendered verification. Local unit,
syntax, IDE, and HTTP checks do not establish third-party iframe compatibility.

Open directly is always available in the wrapper header and opens the requested
registration or wallet URL in a new tab. The link updates when Claim requests the
wallet. If DmFirst blocks framing, exits the wrapper, or fails to sign in, use this
fallback. Our layer does not follow users onto the external tab.

There is no header stripping, proxying of DmFirst content, browser security change,
or attempt to bypass embedding restrictions.

## Local review

Run or restart npm start manually to pick up the registration.html route.

- Full sequence: http://127.0.0.1:4173/
- Landing preview, with automatic navigation paused: http://127.0.0.1:4173/?preview=1
- Wrapper directly: http://127.0.0.1:4173/registration.html
- Fictional ticker preview: http://127.0.0.1:4173/registration.html?activity=demo
- Popup visual preview: http://127.0.0.1:4173/deposit-preview.html
- Separate diagnostic experiment: http://127.0.0.1:4173/iframe-test.html

Check that the actual registration form appears, that popup dismissal/reopening
works, and that authenticated dashboard and wallet navigation function inside
the frame before relying on this as a live registration experience.

All pages load real DmFirst destinations; account creation or deposits require
the visitor's own actions on DmFirst. Tests never submit registrations or payments.
