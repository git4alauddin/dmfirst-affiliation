import {mountRegistrationFlow} from "./registration-flow.js";
import {mountActivityTicker} from "./activity-ticker.js";
import {mountRegistrationAudio} from "./registration-audio.js";
import {mountPredictionWidget} from "./prediction-widget.js";
import {mountDraggableWidget} from "./draggable-widget.js";

const guidance = mountRegistrationAudio(document);
const flow = mountRegistrationFlow(document);
const ticker = mountActivityTicker(document.querySelector("[data-activity-ticker]"));
const prediction = mountPredictionWidget(document);
const draggable = ["[data-deposit-widget]", "[data-prediction-widget]"]
    .map(selector => mountDraggableWidget(document.querySelector(selector)));
window.addEventListener("pagehide", () => {
    draggable.forEach(control => control.destroy());
    guidance.destroy();
    flow.destroy();
    ticker.destroy();
    prediction.destroy();
}, {once: true});
window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.reload();
});
