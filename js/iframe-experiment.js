import {config} from "./config.js";
// Browser-only experiment; local test results do not prove external embedding.
import {mountDepositPrompt} from "./deposit-prompt.js";

const frame = document.querySelector("#dmfirst-frame");
const status = document.querySelector("#iframe-test-status");
const direct = document.querySelector("[data-open-direct]");
const dialog = document.querySelector("#deposit-dialog");
const prompt = mountDepositPrompt(dialog);
const widget = document.querySelector("[data-deposit-widget]");
const showButton = document.querySelector("[data-show-popup]");
const resetButton = document.querySelector("[data-reset-frame]");
const claim = dialog.querySelector("[data-deposit-claim]");
let requestedPage = "registration";
let events = 0;

function requestPage(kind) {
    requestedPage = kind;
    const url = kind === "wallet" ? config.depositUrl : config.registerUrl;
    direct.href = url;
    direct.textContent = kind === "wallet" ? "Open wallet directly ↗" : "Open registration directly ↗";
    status.textContent = `Requesting DmFirst ${kind} inside the iframe. Check the actual content below; compatibility is not verified.`;
    frame.src = url;
}

function frameEvent() {
    events++;
    // Browsers may fire load for blocked frames. Never turn this into a success signal.
    status.textContent = `Frame navigation event ${events} received (${requestedPage} requested). Visually check the page; this event does not confirm successful embedding or registration.`;
}

function showPopup() {
    widget.hidden = true;
    prompt.show();
}

function closed() {
    widget.hidden = false;
}

function reset() {
    requestPage("registration");
}

function claimClicked(event) {
    // Modified clicks retain normal link behavior, including opening another tab.
    if (event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    prompt.close();
    requestPage("wallet");
}

direct.href = config.registerUrl;
if (frame.getAttribute("src") !== config.registerUrl) frame.src = config.registerUrl;
frame.addEventListener("load", frameEvent);
showButton.addEventListener("click", showPopup);
widget.addEventListener("click", showPopup);
dialog.addEventListener("close", closed);
resetButton.addEventListener("click", reset);
claim.addEventListener("click", claimClicked);

window.addEventListener("pagehide", () => {
    frame.removeEventListener("load", frameEvent);
    showButton.removeEventListener("click", showPopup);
    widget.removeEventListener("click", showPopup);
    dialog.removeEventListener("close", closed);
    resetButton.removeEventListener("click", reset);
    claim.removeEventListener("click", claimClicked);
    prompt.destroy();
}, {once: true});
window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.reload();
});
