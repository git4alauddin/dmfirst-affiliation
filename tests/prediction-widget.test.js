import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {mountPredictionWidget} from "../js/prediction-widget.js";
import {predictionConfig} from "../js/prediction-config.js";

const html = await readFile(new URL("../registration.html", import.meta.url), "utf8");

function fixture(enabled = true, settings = {}) {
    const nodes = [...html.matchAll(/<[a-z][a-z0-9-]*\b([^>]*)>/gi)].map(match => {
        const node = new EventTarget();
        const attributes = match[1];
        const updates = new Map();
        node.getAttribute = key => updates.get(key) ?? attributes.match(new RegExp(`(?:^|\\s)${key}="([^"]*)"`))?.[1];
        node.setAttribute = (key, value) => updates.set(key, value);
        node.style = {setProperty(key, value) {this[key] = value;}};
        node.hidden = /(?:^|\s)hidden(?:\s|$)/.test(attributes);
        node.open = false;
        node.opens = 0;
        node.focus = () => { node.focused = true; };
        node.showModal = () => { node.open = true; node.opens++; };
        node.close = () => {
            if (!node.open) return;
            node.open = false;
            node.dispatchEvent(new Event("close"));
        };
        node.getBoundingClientRect = () => ({left: 10, top: 10, right: 300, bottom: 300});
        node.matches = selector => selector.startsWith("#") ? node.getAttribute("id") === selector.slice(1)
            : new RegExp(`(?:^|\\s)${selector.slice(1, -1)}(?:\\s|=|/|$)`).test(attributes);
        return node;
    });
    const page = {
        querySelector: selector => nodes.find(node => node.matches(selector)),
        querySelectorAll: selector => nodes.filter(node => node.matches(selector)),
    };
    const dialog = page.querySelector("#prediction-dialog");
    dialog.querySelector = page.querySelector;
    const animations = [];
    const animate = options => {
        const animation = {...options, stopped: false};
        animations.push(animation);
        options.onUpdate({progress: 0});
        return () => {animation.stopped = true;};
    };
    const reelState = {enabled: false, resets: 0, destroyed: false};
    const mountReels = () => ({
        reset() {reelState.enabled = false; reelState.resets++;},
        enable() {reelState.enabled = true;},
        destroy() {reelState.destroyed = true;},
    });
    const widget = mountPredictionWidget(page, {enabled, ...settings}, animate, mountReels);
    return {widget, dialog, page, button: page.querySelector("[data-prediction-widget]"),
        dismiss: page.querySelector("[data-dismiss-prediction]"),
        heading: page.querySelector("[data-prediction-heading]"),
        input: page.querySelector("[data-prediction-code]"),
        form: page.querySelector("[data-prediction-code-form]"),
        error: page.querySelector("[data-prediction-code-error]"),
        access: page.querySelector("[data-prediction-access]"),
        preview: page.querySelector("[data-prediction-preview]"),
        submit: page.querySelector("[data-prediction-unlock]"),
        submitLabel: page.querySelector("[data-prediction-unlock-label]"),
        progressPanel: page.querySelector("[data-prediction-unlock-progress]"),
        progressBar: page.querySelector("[data-prediction-progressbar]"),
        percent: page.querySelector("[data-prediction-percent]"),
        adminContact: page.querySelector("[data-prediction-admin-contact]"),
        adminText: page.querySelector("[data-prediction-admin-text]"),
        adminLink: page.querySelector("[data-prediction-admin-link]"),
        animations, reelState,
        deposit: page.querySelector("#deposit-dialog")};
}

function submitCode(state, code) {
    state.input.value = code;
    const event = new Event("submit", {cancelable: true});
    state.form.dispatchEvent(event);
    return event;
}

test("disabled configuration keeps the floating button hidden and inactive", () => {
    const state = fixture(false);
    assert.equal(state.button.hidden, true);
    state.button.dispatchEvent(new Event("click"));
    assert.equal(state.dialog.open, false);
    state.widget.destroy();
});

test("enabled button opens the code prompt with the preview hidden and Close restores focus", () => {
    const state = fixture();
    assert.equal(state.button.hidden, false);
    assert.equal(state.dialog.open, false, "the new popup never opens automatically");
    state.button.dispatchEvent(new Event("click"));
    state.button.dispatchEvent(new Event("click"));
    assert.equal(state.dialog.opens, 1);
    assert.equal(state.input.focused, true);
    assert.equal(state.preview.hidden, true);
    assert.equal(state.access.hidden, false);
    assert.equal(state.button.getAttribute("aria-expanded"), "true");
    assert.equal(state.heading.textContent, predictionConfig.gameName);
    assert.equal([...html.matchAll(/\sdata-prediction-number(?:\s|>)/g)].length, 2);
    assert.match(html, /class="prediction-trigger"[^>]*disabled>Predict<\/button>/);
    state.dismiss.dispatchEvent(new Event("click"));
    assert.equal(state.dialog.open, false);
    assert.equal(state.button.getAttribute("aria-expanded"), "false");
    assert.equal(state.button.focused, true);
    state.widget.destroy();
});

test("empty codes show a required-code error without starting progress", () => {
    const state = fixture();
    state.button.dispatchEvent(new Event("click"));
    assert.equal(submitCode(state, "").defaultPrevented, true);
    assert.equal(state.error.hidden, false);
    assert.equal(state.error.textContent, "Enter your access code.");
    assert.equal(state.input.getAttribute("aria-invalid"), "true");
    assert.equal(state.preview.hidden, true);
    assert.equal(state.progressPanel.hidden, true);
    assert.equal(state.animations.length, 0);
    state.input.dispatchEvent(new Event("input"));
    assert.equal(state.error.hidden, true);
    assert.equal(state.input.getAttribute("aria-invalid"), "false");
    state.widget.destroy();
});

test("wrong codes complete the bar before showing red failure feedback and admin contact", () => {
    const state = fixture();
    state.button.dispatchEvent(new Event("click"));
    submitCode(state, "WRONG");
    assert.equal(state.error.hidden, true);
    assert.equal(state.adminContact.hidden, true);
    assert.equal(state.preview.hidden, true);
    assert.equal(state.progressPanel.hidden, false);
    assert.equal(state.form.hidden, true);
    assert.equal(state.animations.length, 1);
    state.animations[0].onUpdate({progress: 100});
    assert.equal(state.error.hidden, true, "even 100% is held before failure appears");
    state.animations[0].onComplete();
    assert.equal(state.dialog.getAttribute("data-access-state"), "failed");
    assert.equal(state.progressPanel.hidden, true, "the completed bar is removed from the failure screen");
    assert.equal(state.error.hidden, false);
    assert.match(state.error.textContent, /doesn't match/);
    assert.equal(state.adminContact.hidden, false);
    assert.equal(state.adminText.textContent, predictionConfig.adminContact.text);
    assert.equal(state.percent.textContent, "100%");
    assert.equal(state.input.getAttribute("aria-invalid"), "true");
    assert.equal(state.reelState.enabled, false);
    assert.equal(state.preview.hidden, true);
    state.input.value = "DMFIRST";
    state.input.dispatchEvent(new Event("input"));
    assert.equal(state.error.hidden, true);
    assert.equal(state.adminContact.hidden, true);
    assert.equal(state.progressPanel.hidden, true);
    assert.equal(state.dialog.getAttribute("data-access-state"), "entry");
    assert.equal(state.input.value, "DMFIRST", "typing is preserved while clearing feedback");
    submitCode(state, "DMFIRST");
    state.animations[1].onComplete();
    assert.equal(state.preview.hidden, false, "a correct retry opens the preview");
    assert.equal(state.reelState.enabled, true);
    state.widget.destroy();
});

test("failed-code contact uses configurable text and only supported contact links", () => {
    for (const [url, linked] of [["https://t.me/example_admin", true], ["mailto:admin@example.com", true], ["javascript:alert(1)", false]]) {
        const state = fixture(true, {adminContact: {text: "Contact admin", url}});
        state.button.dispatchEvent(new Event("click"));
        submitCode(state, "WRONG");
        state.animations[0].onComplete();
        assert.equal(state.adminContact.hidden, false);
        assert.equal(state.adminLink.hidden, !linked);
        assert.equal(state.adminText.hidden, linked);
        if (linked) assert.equal(state.adminLink.getAttribute("href"), url);
        state.widget.destroy();
    }
});

test("Telegram usernames become visible DM links in the failed-code contact box", () => {
    for (const username of ["@example_admin", "example_admin"]) {
        const state = fixture(true, {adminContact: {telegramUsername: username, text: "Fallback", url: ""}});
        state.button.dispatchEvent(new Event("click"));
        submitCode(state, "WRONG");
        state.animations[0].onComplete();
        assert.equal(state.adminContact.hidden, false);
        assert.equal(state.adminLink.hidden, false);
        assert.equal(state.adminLink.textContent, "@example_admin");
        assert.equal(state.adminLink.getAttribute("href"), "https://t.me/example_admin");
        assert.equal(state.adminLink.getAttribute("target"), "_blank");
        state.widget.destroy();
    }
});

test("configured code runs one progress sequence, holds 100%, then reveals the preview", () => {
    const state = fixture(true, {accessCode: "TEST-42", unlockDurationMs: 750});
    state.button.dispatchEvent(new Event("click"));
    submitCode(state, " TEST-42 ");
    assert.equal(state.animations.length, 1);
    assert.equal(state.form.hidden, true);
    assert.equal(state.progressPanel.hidden, false);
    assert.equal(state.preview.hidden, true);
    assert.equal(state.input.value, "");
    const animation = state.animations[0];
    assert.deepEqual(animation.timing, {fillMs: 750, holdMs: 300, unlockMs: 0});
    animation.onUpdate({progress: 65});
    assert.equal(state.progressBar.getAttribute("aria-valuenow"), "65");
    assert.equal(state.progressBar.style["--unlock-progress"], "65%");
    animation.onUpdate({progress: 100});
    assert.equal(state.percent.textContent, "100%");
    assert.equal(state.preview.hidden, true, "100% is held before completion");
    submitCode(state, "TEST-42");
    assert.equal(state.animations.length, 1, "duplicate submits cannot overlap animations");
    animation.onComplete();
    assert.equal(state.access.hidden, true);
    assert.equal(state.preview.hidden, false);
    assert.equal(state.reelState.enabled, true);
    assert.equal(state.dialog.getAttribute("aria-labelledby"), "prediction-title");
    assert.equal(state.heading.focused, true);
    state.dismiss.dispatchEvent(new Event("click"));
    state.button.dispatchEvent(new Event("click"));
    assert.equal(state.preview.hidden, true, "each new opening asks for the code again");
    assert.equal(state.reelState.enabled, false);
    state.widget.destroy();
});

test("closing or destroying during progress cancels it and ignores stale callbacks", () => {
    const state = fixture();
    state.button.dispatchEvent(new Event("click"));
    submitCode(state, "WRONG");
    const first = state.animations[0];
    state.dismiss.dispatchEvent(new Event("click"));
    assert.equal(first.stopped, true);
    state.button.dispatchEvent(new Event("click"));
    first.onUpdate({progress: 100});
    first.onComplete();
    assert.equal(state.preview.hidden, true);
    assert.equal(state.adminContact.hidden, true, "cancelled checks cannot show stale admin feedback");
    assert.equal(state.percent.textContent, "0%");
    submitCode(state, "DMFIRST");
    const second = state.animations[1];
    state.widget.destroy();
    assert.equal(second.stopped, true);
    second.onComplete();
    submitCode(state, "DMFIRST");
    assert.equal(state.preview.hidden, true);
    assert.equal(state.animations.length, 2);
    assert.equal(state.dialog.open, false);
});

test("an empty configured code keeps access closed", () => {
    const state = fixture(true, {accessCode: ""});
    state.button.dispatchEvent(new Event("click"));
    assert.equal(state.submit.disabled, true);
    assert.equal(state.error.hidden, false);
    submitCode(state, "");
    assert.equal(state.animations.length, 0);
    assert.equal(state.preview.hidden, true);
    state.widget.destroy();
});

test("a delayed close event cannot reset a popup that has already reopened", () => {
    const state = fixture();
    state.button.dispatchEvent(new Event("click"));
    state.dismiss.dispatchEvent(new Event("click"));
    state.button.dispatchEvent(new Event("click"));
    submitCode(state, "DMFIRST");
    state.animations[0].onUpdate({progress: 40});
    state.dialog.dispatchEvent(new Event("close"));
    assert.equal(state.progressPanel.hidden, false);
    assert.equal(state.percent.textContent, "40%");
    assert.equal(state.animations[0].stopped, false);
    state.animations[0].onComplete();
    assert.equal(state.preview.hidden, false);
    state.widget.destroy();
});

test("backdrop dismissal only closes outside the shell; native close resets its state", () => {
    const state = fixture();
    state.button.dispatchEvent(new Event("click"));
    state.dialog.dispatchEvent(Object.assign(new Event("click"), {clientX: 100, clientY: 100}));
    assert.equal(state.dialog.open, true);
    state.dialog.dispatchEvent(Object.assign(new Event("click"), {clientX: 0, clientY: 0}));
    assert.equal(state.dialog.open, false);
    state.button.dispatchEvent(new Event("click"));
    state.dialog.close();
    assert.equal(state.button.getAttribute("aria-expanded"), "false");
    state.widget.destroy();
});

test("deposit modal takes priority and teardown removes the new controls", () => {
    const state = fixture();
    state.deposit.showModal();
    state.button.dispatchEvent(new Event("click"));
    assert.equal(state.dialog.open, false);
    state.deposit.close();
    state.button.dispatchEvent(new Event("click"));
    state.widget.destroy();
    assert.equal(state.button.hidden, true);
    assert.equal(state.dialog.open, false);
    state.button.dispatchEvent(new Event("click"));
    assert.equal(state.dialog.open, false);
});

test("configured text follows entry, checking, failure, retry, and reopening", () => {
    const text = {
        widgetLabel: "OPEN",
        widgetAriaLabel: "Open local preview",
        closeLabel: "Close local preview",
        entryTitle: "Your code",
        entryHelp: "Type the supplied code.",
        unlockButton: "Continue",
        requiredCodeError: "A code is required.",
        checkingTitle: "Verifying",
        checkingHelp: "Checking your entry.",
        checkingProgress: "Please wait",
        deniedTitle: "Incorrect code",
        deniedHelp: "Please retry.",
        invalidCodeError: "Code not recognized.",
        retryButton: "Retry code",
        adminTitle: "Get help",
        progressAriaLabel: "Code check progress",
    };
    const state = fixture(true, {text, unlockHoldMs: 125, gameName: "Configured game"});
    const title = state.page.querySelector("[data-prediction-access-title]");
    const help = state.page.querySelector("[data-prediction-access-help]");
    for (const element of state.page.querySelectorAll("[data-prediction-text]")) {
        const key = element.getAttribute("data-prediction-text");
        assert.equal(element.textContent, text[key] ?? predictionConfig.text[key]);
    }
    assert.equal(state.button.getAttribute("aria-label"), text.widgetAriaLabel);
    assert.equal(state.dismiss.getAttribute("aria-label"), text.closeLabel);
    assert.equal(state.progressBar.getAttribute("aria-label"), text.progressAriaLabel);
    assert.equal(state.heading.textContent, "Configured game");
    state.button.dispatchEvent(new Event("click"));
    assert.equal(title.textContent, text.entryTitle);
    assert.equal(help.textContent, text.entryHelp);
    assert.equal(state.submitLabel.textContent, text.unlockButton);
    submitCode(state, "");
    assert.equal(state.error.textContent, text.requiredCodeError);
    submitCode(state, "WRONG");
    assert.equal(title.textContent, text.checkingTitle);
    assert.equal(help.textContent, text.checkingHelp);
    assert.equal(state.page.querySelector("[data-prediction-progress-label]").textContent, text.checkingProgress);
    assert.equal(state.animations[0].timing.holdMs, 125);
    state.animations[0].onComplete();
    assert.equal(title.textContent, text.deniedTitle);
    assert.equal(help.textContent, text.deniedHelp);
    assert.equal(state.error.textContent, text.invalidCodeError);
    assert.equal(state.submitLabel.textContent, text.retryButton);
    state.input.dispatchEvent(new Event("input"));
    assert.equal(title.textContent, text.entryTitle);
    assert.equal(state.submitLabel.textContent, text.unlockButton);
    state.dismiss.dispatchEvent(new Event("click"));
    state.button.dispatchEvent(new Event("click"));
    assert.equal(help.textContent, text.entryHelp);
    state.widget.destroy();
});
