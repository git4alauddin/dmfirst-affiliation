import {config} from "./config.js";

/** Mount on an authorized host page; showing it does not authenticate an account. */
export function mountDepositPrompt(dialog, settings = config) {
    if (!Number.isFinite(settings.minimumDeposit) || settings.minimumDeposit <= 0) {
        throw new RangeError("A positive minimum deposit is required.");
    }
    const formatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: settings.depositCurrency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    });
    const amount = formatter.format(settings.minimumDeposit);
    dialog.querySelectorAll("[data-deposit-amount]").forEach((element) => {
        element.textContent = amount;
    });
    dialog.querySelector("[data-deposit-currency]").textContent = settings.depositCurrency === "INR"
        ? "INDIAN RUPEES · INR" : settings.depositCurrency;
    dialog.querySelector("[data-deposit-currency-code]").textContent = settings.depositCurrency;
    dialog.querySelector("[data-deposit-minimum-label]").textContent = `${amount} MINIMUM`;

    const claim = dialog.querySelector("[data-deposit-claim]");
    claim.href = settings.depositUrl;
    const dismiss = dialog.querySelector("[data-dismiss-deposit]");

    function close() {
        if (dialog.open) dialog.close();
    }

    function backdropClick(event) {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }

    dismiss.addEventListener("click", close);
    dialog.addEventListener("click", backdropClick);

    return {
        show() {
            if (!dialog.open) {
                dialog.showModal();
                dialog.querySelector("[data-deposit-heading]").focus();
            }
        },
        close,
        destroy() {
            close();
            dismiss.removeEventListener("click", close);
            dialog.removeEventListener("click", backdropClick);
        },
    };
}
