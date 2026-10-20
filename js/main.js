import { config } from "./config.js";

// All registration calls to action use the same referral destination.
document.querySelectorAll("[data-register-link]").forEach((link) => {
  link.href = config.registerUrl;
});

