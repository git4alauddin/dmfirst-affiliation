import {mountRegistrationFlow} from "./registration-flow.js";
import {mountActivityTicker} from "./activity-ticker.js";

const flow = mountRegistrationFlow(document);
const demoActivity = new URLSearchParams(window.location.search).get("activity") === "demo";
const ticker = mountActivityTicker(document.querySelector("[data-activity-ticker]"), {demo: demoActivity});
window.addEventListener("pagehide", () => {
    flow.destroy();
    ticker.destroy();
}, {once: true});
window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.reload();
});
