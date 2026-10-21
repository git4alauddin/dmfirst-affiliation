import {config} from "./config.js";

const amountRanges = {
    deposit: [500, 2000],
    withdrawal: [30000, 70000],
    win: [10000, 30000],
};

const avatarPaths = {
    man: "./assets/images/avatars/avatar-01.png",
    woman: "./assets/images/avatars/avatar-02.png",
    beardedMan: "./assets/images/avatars/avatar-03.png",
};

// Fictional profiles only. Avatar assignments are explicit and stay fixed across rotations.
const sampleProfiles = [
    {username: "Aarav_24", primary: "****21", avatar: avatarPaths.man},
    {username: "Kavya_87", primary: "****08", avatar: avatarPaths.woman},
    {username: "Rohan_51", primary: "****46", avatar: avatarPaths.beardedMan},
    {username: "Meera_32", primary: "****35", avatar: avatarPaths.woman},
    {username: "Arjun_09", primary: "****17", avatar: avatarPaths.man},
    {username: "Isha_63", primary: "****62", avatar: avatarPaths.woman},
    {username: "Vihaan_18", primary: "****74", avatar: avatarPaths.beardedMan},
    {username: "Ananya_45", primary: "****93", avatar: avatarPaths.woman},
    {username: "Aditya_72", primary: "****56", avatar: avatarPaths.man},
    {username: "Diya_26", primary: "****41", avatar: avatarPaths.woman},
    {username: "Kabir_39", primary: "****85", avatar: avatarPaths.beardedMan},
    {username: "Saanvi_14", primary: "****29", avatar: avatarPaths.woman},
    {username: "Ishaan_68", primary: "****04", avatar: avatarPaths.man},
    {username: "Aditi_53", primary: "****68", avatar: avatarPaths.woman},
    {username: "Dev_82", primary: "****13", avatar: avatarPaths.beardedMan},
    {username: "Nisha_47", primary: "****77", avatar: avatarPaths.woman},
    {username: "Yash_16", primary: "****52", avatar: avatarPaths.man},
    {username: "Tara_91", primary: "****96", avatar: avatarPaths.woman},
    {username: "Kunal_34", primary: "****38", avatar: avatarPaths.beardedMan},
    {username: "Riya_58", primary: "****15", avatar: avatarPaths.woman},
    {username: "Dhruv_23", primary: "****83", avatar: avatarPaths.man},
    {username: "Neha_76", primary: "****47", avatar: avatarPaths.woman},
    {username: "Nikhil_42", primary: "****61", avatar: avatarPaths.beardedMan},
    {username: "Priya_65", primary: "****02", avatar: avatarPaths.woman},
    {username: "Sahil_07", primary: "****79", avatar: avatarPaths.man},
    {username: "Anika_38", primary: "****24", avatar: avatarPaths.woman},
    {username: "Varun_94", primary: "****58", avatar: avatarPaths.beardedMan},
    {username: "Pooja_21", primary: "****91", avatar: avatarPaths.woman},
    {username: "Aryan_56", primary: "****33", avatar: avatarPaths.man},
    {username: "Sneha_83", primary: "****06", avatar: avatarPaths.woman},
    {username: "Vivek_31", primary: "****72", avatar: avatarPaths.beardedMan},
    {username: "Simran_69", primary: "****49", avatar: avatarPaths.woman},
    {username: "Manav_48", primary: "****18", avatar: avatarPaths.man},
    {username: "Zoya_12", primary: "****87", avatar: avatarPaths.woman},
    {username: "Pranav_75", primary: "****54", avatar: avatarPaths.beardedMan},
    {username: "Fatima_36", primary: "****09", avatar: avatarPaths.woman},
];

const categories = [
    {secondary: "Deposit", kind: "deposit"},
    {secondary: "Withdrawal", kind: "withdrawal"},
    {secondary: "Win", kind: "win"},
];

/** All entries are labeled demo examples until a verified activity source is connected. */
export function getActivityItems({settings = config, random = Math.random, previousUsername} = {}) {
    const money = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: settings.depositCurrency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    });
    const profiles = [...sampleProfiles];
    for (let index = profiles.length - 1; index > 0; index--) {
        const other = Math.floor(random() * (index + 1));
        [profiles[index], profiles[other]] = [profiles[other], profiles[index]];
    }
    if (profiles[0].username === previousUsername) {
        [profiles[0], profiles[1]] = [profiles[1], profiles[0]];
    }
    return profiles.map((profile, index) => {
        const item = {...profile, ...categories[index % categories.length]};
        const [minimum, maximum] = amountRanges[item.kind];
        const step = 500;
        const choices = (maximum - minimum) / step + 1;
        const amount = minimum + Math.floor(random() * choices) * step;
        return {...item, amount, value: money.format(amount)};
    });
}
