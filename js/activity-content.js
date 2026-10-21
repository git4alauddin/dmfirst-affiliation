import {config} from "./config.js";

const amountRanges = {
    deposit: [500, 2000],
    withdrawal: [30000, 70000],
    win: [10000, 30000],
};

/** All entries are labeled demo examples until a verified activity source is connected. */
export function getActivityItems({settings = config, random = Math.random} = {}) {
    const money = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: settings.depositCurrency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    });
    return [
        {primary: "****21", secondary: "Deposit", kind: "deposit"},
        {primary: "****08", secondary: "Withdrawal", kind: "withdrawal"},
        {primary: "****46", secondary: "Win", kind: "win"},
        {primary: "****35", secondary: "Deposit", kind: "deposit"},
        {primary: "****17", secondary: "Withdrawal", kind: "withdrawal"},
        {primary: "****62", secondary: "Win", kind: "win"},
    ].map((item) => {
        const [minimum, maximum] = amountRanges[item.kind];
        const step = 500;
        const choices = (maximum - minimum) / step + 1;
        const amount = minimum + Math.floor(random() * choices) * step;
        return {...item, amount, value: money.format(amount)};
    });
}
