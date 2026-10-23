import {getPredictionText, predictionConfig} from "./prediction-config.js";
import {playAccessSequence} from "./animations.js";
import {mountPredictionReels} from "./prediction-reels.js";

/** Code-gated preset simulation. No live game is connected. */
export function mountPredictionWidget(page, settings = predictionConfig, animate = playAccessSequence, mountReels = mountPredictionReels) {
    const button = page.querySelector("[data-prediction-widget]");
    const dialog = page.querySelector("#prediction-dialog");
    const dismiss = dialog.querySelector("[data-dismiss-prediction]");
    let destroyed = false;

    button.hidden = settings.enabled !== true;
    button.setAttribute("aria-expanded", "false");
    if (button.hidden) return {destroy() {}};
    const text = getPredictionText(settings);
    page.querySelectorAll("[data-prediction-text]").forEach(element => {
        element.textContent = text[element.getAttribute("data-prediction-text")];
    });
    button.setAttribute("aria-label", text.widgetAriaLabel);
    dismiss.setAttribute("aria-label", text.closeLabel);
    const reels = mountReels(dialog, settings);
    const heading = dialog.querySelector("[data-prediction-heading]");
    const access = dialog.querySelector("[data-prediction-access]");
    const preview = dialog.querySelector("[data-prediction-preview]");
    const form = dialog.querySelector("[data-prediction-code-form]");
    const input = dialog.querySelector("[data-prediction-code]");
    const submit = dialog.querySelector("[data-prediction-unlock]");
    const submitLabel = dialog.querySelector("[data-prediction-unlock-label]");
    const error = dialog.querySelector("[data-prediction-code-error]");
    const accessTitle = dialog.querySelector("[data-prediction-access-title]");
    const help = dialog.querySelector("[data-prediction-access-help]");
    const progressPanel = dialog.querySelector("[data-prediction-unlock-progress]");
    const progressBar = dialog.querySelector("[data-prediction-progressbar]");
    const percent = dialog.querySelector("[data-prediction-percent]");
    const progressLabel = dialog.querySelector("[data-prediction-progress-label]");
    progressBar.setAttribute("aria-label", text.progressAriaLabel);
    const adminContact = dialog.querySelector("[data-prediction-admin-contact]");
    const adminText = dialog.querySelector("[data-prediction-admin-text]");
    const adminLink = dialog.querySelector("[data-prediction-admin-link]");
    const contact = settings.adminContact ?? predictionConfig.adminContact;
    const rawUsername = typeof contact.telegramUsername === "string" ? contact.telegramUsername.trim().replace(/^@/, "") : "";
    const username = /^[a-zA-Z0-9_]+$/.test(rawUsername) ? rawUsername : "";
    let contactText = contact.text?.trim() || predictionConfig.adminContact.text;
    let contactUrl = "";
    try {
        const url = new URL(username ? `https://t.me/${username}` : contact.url);
        if (["https:", "http:", "mailto:", "tel:"].includes(url.protocol)) contactUrl = url.href;
        const telegramPath = url.pathname.replace(/^\//, "").replace(/\/$/, "");
        if (contactUrl && ["t.me", "www.t.me"].includes(url.hostname) && /^[a-zA-Z0-9_]+$/.test(telegramPath)) {
            contactText = `@${telegramPath}`;
        }
    } catch {}
    adminText.textContent = contactText;
    adminText.hidden = Boolean(contactUrl);
    adminLink.hidden = !contactUrl;
    adminLink.textContent = contactText;
    if (contactUrl) adminLink.setAttribute("href", contactUrl);
    const configuredCode = settings.accessCode ?? predictionConfig.accessCode;
    const code = typeof configuredCode === "string" ? configuredCode.trim() : "";
    const duration = settings.unlockDurationMs ?? predictionConfig.unlockDurationMs;
    const fillMs = Number.isFinite(duration) && duration > 0 ? duration : predictionConfig.unlockDurationMs;
    const configuredHold = settings.unlockHoldMs ?? predictionConfig.unlockHoldMs;
    const holdMs = Number.isFinite(configuredHold) && configuredHold >= 0 ? configuredHold : predictionConfig.unlockHoldMs;
    let phase;
    let runId = 0;
    let cancelUnlock = () => {};
    heading.textContent = settings.gameName ?? predictionConfig.gameName;

    function setProgress(progress) {
        progressBar.style.setProperty("--unlock-progress", `${progress}%`);
        progressBar.setAttribute("aria-valuenow", String(progress));
        percent.textContent = `${progress}%`;
    }

    function resetGate() {
        reels.reset();
        runId++;
        cancelUnlock();
        phase = "entry";
        dialog.setAttribute("data-access-state", "entry");
        dialog.setAttribute("aria-labelledby", "prediction-access-title");
        dialog.setAttribute("aria-describedby", "prediction-access-help");
        access.hidden = false;
        preview.hidden = true;
        form.hidden = false;
        progressPanel.hidden = true;
        input.value = "";
        input.setAttribute("aria-invalid", "false");
        error.textContent = code ? "" : text.unavailableError;
        error.hidden = Boolean(code);
        adminContact.hidden = true;
        submit.disabled = !code;
        submitLabel.textContent = text.unlockButton;
        accessTitle.textContent = text.entryTitle;
        help.textContent = text.entryHelp;
        setProgress(0);
        progressLabel.textContent = text.openingProgress;
    }

    function clearError() {
        if (phase !== "entry" || !code) return;
        error.hidden = true;
        adminContact.hidden = true;
        input.setAttribute("aria-invalid", "false");
        dialog.setAttribute("data-access-state", "entry");
        accessTitle.textContent = text.entryTitle;
        help.textContent = text.entryHelp;
        submitLabel.textContent = text.unlockButton;
        progressPanel.hidden = true;
        setProgress(0);
    }

    function unlock(event) {
        event.preventDefault();
        if (destroyed || !dialog.open || phase !== "entry" || !code) return;
        const entered = input.value.trim();
        if (!entered) {
            clearError();
            error.textContent = text.requiredCodeError;
            error.hidden = false;
            input.setAttribute("aria-invalid", "true");
            input.focus();
            return;
        }
        const matches = entered === code;
        phase = "opening";
        const run = ++runId;
        dialog.setAttribute("data-access-state", "opening");
        input.value = "";
        error.hidden = true;
        adminContact.hidden = true;
        input.setAttribute("aria-invalid", "false");
        form.hidden = true;
        progressPanel.hidden = false;
        accessTitle.textContent = text.checkingTitle;
        help.textContent = text.checkingHelp;
        progressLabel.textContent = text.checkingProgress;
        accessTitle.focus();
        cancelUnlock = animate({
            timing: {fillMs, holdMs, unlockMs: 0},
            onUpdate({progress}) {
                if (!destroyed && run === runId) setProgress(progress);
            },
            onComplete() {
                if (destroyed || run !== runId || !dialog.open) return;
                setProgress(100);
                if (!matches) {
                    phase = "entry";
                    dialog.setAttribute("data-access-state", "failed");
                    accessTitle.textContent = text.deniedTitle;
                    help.textContent = text.deniedHelp;
                    progressPanel.hidden = true;
                    error.textContent = text.invalidCodeError;
                    error.hidden = false;
                    adminContact.hidden = false;
                    form.hidden = false;
                    submitLabel.textContent = text.retryButton;
                    input.setAttribute("aria-invalid", "true");
                    input.focus();
                    return;
                }
                phase = "ready";
                dialog.setAttribute("data-access-state", "ready");
                dialog.setAttribute("aria-labelledby", "prediction-title");
                dialog.setAttribute("aria-describedby", "prediction-preview-note");
                access.hidden = true;
                preview.hidden = false;
                reels.enable();
                heading.focus();
            },
        });
    }

    resetGate();

    function show() {
        if (destroyed || dialog.open || page.querySelector("#deposit-dialog")?.open) return;
        resetGate();
        dialog.showModal();
        button.setAttribute("aria-expanded", "true");
        input.focus();
    }

    function close() {
        if (dialog.open) dialog.close();
    }

    function closed() {
        // Native close events are queued; a fast reopen can happen before delivery.
        if (dialog.open) return;
        resetGate();
        button.setAttribute("aria-expanded", "false");
        if (!destroyed) button.focus();
    }

    function backdropClick(event) {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right
            || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }

    button.addEventListener("click", show);
    form.addEventListener("submit", unlock);
    input.addEventListener("input", clearError);
    dismiss.addEventListener("click", close);
    dialog.addEventListener("click", backdropClick);
    dialog.addEventListener("close", closed);
    return {
        destroy() {
            destroyed = true;
            runId++;
            cancelUnlock();
            reels.destroy();
            button.hidden = true;
            button.setAttribute("aria-expanded", "false");
            button.removeEventListener("click", show);
            form.removeEventListener("submit", unlock);
            input.removeEventListener("input", clearError);
            dismiss.removeEventListener("click", close);
            dialog.removeEventListener("click", backdropClick);
            dialog.removeEventListener("close", closed);
            close();
        },
    };
}
