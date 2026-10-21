import {config} from "./config.js";
import {playAccessSequence} from "./animations.js";
import {mountDepositPrompt} from "./deposit-prompt.js";
import {mountDepositWidget} from "./deposit-widget.js";

export function schedulePromotion(delayMs, callback) {
    return playAccessSequence({
        timing: {fillMs: Math.max(1, delayMs), holdMs: 0, unlockMs: 0},
        onUpdate() {
        },
        onComplete: callback,
    });
}

/** Own the promotional layer; do not inspect DmFirst's document or account state. */
export function mountRegistrationFlow(page, settings = config, schedule = schedulePromotion) {
    const frame = page.querySelector("#dmfirst-frame");
    const direct = page.querySelector("[data-open-direct]");
    const dialog = page.querySelector("#deposit-dialog");
    const widget = page.querySelector("[data-deposit-widget]");
    const details = page.querySelector("[data-show-deposit]");
    const claim = dialog.querySelector("[data-deposit-claim]");
    const prompt = mountDepositPrompt(dialog, settings);
    const floating = mountDepositWidget(dialog, widget, prompt);
    let destroyed = false;

    direct.href = settings.registerUrl;
    if (frame.getAttribute("src") !== settings.registerUrl) frame.src = settings.registerUrl;
    // A marketing delay, not an indication that registration succeeded.
    const cancelPromotion = schedule(settings.popupDelayMs, () => {
        if (!destroyed) floating.show();
    });

    function showDetails() {
        cancelPromotion();
        floating.show();
    }

    function claimClicked(event) {
        if (event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        cancelPromotion();
        prompt.close();
        frame.src = settings.depositUrl;
        frame.title = "DmFirst wallet recharge";
        direct.href = settings.depositUrl;
    }

    details.addEventListener("click", showDetails);
    claim.addEventListener("click", claimClicked);
    return {
        destroy() {
            destroyed = true;
            cancelPromotion();
            details.removeEventListener("click", showDetails);
            claim.removeEventListener("click", claimClicked);
            floating.destroy();
            prompt.destroy();
        },
    };
}
