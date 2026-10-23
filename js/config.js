// Public destinations only. Never place credentials in client-side files.
export const config = Object.freeze({
    registerUrl:
        "https://www.dmfirst0.com/#/register?invitationCode=93458117528",
    registrationPage: "./registration.html",
    depositUrl: "https://www.dmfirst0.com/#/wallet/Recharge",
    popupDelayMs: 1000,
    activityIntervalMs: 4000,
    minimumDeposit: 500,
    depositCurrency: "INR",
    copyCodeDemo: Object.freeze({
        heading: "Already deposited?",
        caption: "Claim now",
        buttonText: "Copy Code",
        loadingText: "Copying…",
        completeText: "Text copied",
    }),
    sequence: Object.freeze({
        fillMs: 1800,
        holdMs: 300,
        unlockMs: 900,
    }),
});
