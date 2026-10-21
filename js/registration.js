import {mountRegistrationFlow} from "./registration-flow.js";
import {mountActivityTicker} from "./activity-ticker.js";
import {mountRegistrationAudio} from "./registration-audio.js";

const guidance = mountRegistrationAudio(document);
const flow = mountRegistrationFlow(document);
const ticker = mountActivityTicker(document.querySelector("[data-activity-ticker]"));
window.addEventListener("pagehide", () => {
    guidance.destroy();
    flow.destroy();
    ticker.destroy();
}, {once: true});
window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.reload();
});
