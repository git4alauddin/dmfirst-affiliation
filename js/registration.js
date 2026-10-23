import {mountRegistrationFlow} from "./registration-flow.js";
import {mountActivityTicker} from "./activity-ticker.js";
import {mountRegistrationAudio} from "./registration-audio.js";
import {mountPredictionWidget} from "./prediction-widget.js";

const guidance = mountRegistrationAudio(document);
const flow = mountRegistrationFlow(document);
const ticker = mountActivityTicker(document.querySelector("[data-activity-ticker]"));
const prediction = mountPredictionWidget(document);
window.addEventListener("pagehide", () => {
    guidance.destroy();
    flow.destroy();
    ticker.destroy();
    prediction.destroy();
}, {once: true});
window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.reload();
});
