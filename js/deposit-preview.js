import {mountDepositPrompt} from "./deposit-prompt.js";

// This page previews the popup; it does not observe DmFirst registration state.
const prompt = mountDepositPrompt(document.querySelector("#deposit-dialog"));
const opener = document.querySelector("[data-open-deposit]");
const show = () => prompt.show();
opener.addEventListener("click", show);
prompt.show();

window.addEventListener("pagehide", () => {
    prompt.destroy();
    opener.removeEventListener("click", show);
});
window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.reload();
});
