import {config} from "./config.js";

/** Preview examples are explicitly fictional; the normal page shows factual guidance. */
export function getActivityItems({demo = false, settings = config} = {}) {
    const money = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: settings.depositCurrency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    });
    if (demo === true) {
        return [
            {primary: "R***21", secondary: "deposited", amount: 500, avatar: "R", kind: "deposit"},
            {primary: "A***08", secondary: "claimed", amount: 750, avatar: "A", kind: "claim"},
            {primary: "S***46", secondary: "deposited", amount: 1000, avatar: "S", kind: "deposit"},
            {primary: "N***35", secondary: "claimed", amount: 1250, avatar: "N", kind: "claim"},
            {primary: "K***17", secondary: "deposited", amount: 2000, avatar: "K", kind: "deposit"},
        ].map((item) => ({...item, badge: "DEMO", value: money.format(item.amount), valueKind: "amount"}));
    }
    return [
        {
            primary: "Minimum deposit",
            secondary: "Indian rupees",
            value: money.format(settings.minimumDeposit),
            avatar: "₹",
            badge: "INFO",
            kind: "info",
            valueKind: "amount"
        },
        {
            primary: "Registration",
            secondary: "Referral invitation",
            value: "DM FIRST",
            avatar: "↗",
            badge: "GUIDE",
            kind: "info",
            valueKind: "label"
        },
        {
            primary: "Wallet recharge",
            secondary: "Through DmFirst",
            value: "CLAIM",
            avatar: "⇄",
            badge: "GUIDE",
            kind: "info",
            valueKind: "label"
        },
        {
            primary: "Deposit details",
            secondary: "Available on this page",
            value: money.format(settings.minimumDeposit),
            avatar: "₹",
            badge: "INFO",
            kind: "info",
            valueKind: "amount"
        },
    ];
}
