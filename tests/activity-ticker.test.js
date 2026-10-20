import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {getActivityItems} from "../js/activity-content.js";
import {mountActivityTicker} from "../js/activity-ticker.js";
import {config} from "../js/config.js";

const html = await readFile(new URL("../registration.html", import.meta.url), "utf8");

function fixture({demo = false, reduced = false} = {}) {
    const page = new EventTarget();
    page.hidden = false;
    const motion = new EventTarget();
    motion.matches = reduced;
    const frames = new Map();
    let id = 0;
    let now = 0;
    page.defaultView = {
        matchMedia: () => motion,
        requestAnimationFrame(callback) {
            frames.set(++id, callback);
            return id;
        },
        cancelAnimationFrame(frameId) {
            frames.delete(frameId);
        },
    };
    const nodes = new Map();
    for (const match of html.matchAll(/<[a-z][a-z0-9-]*\b([^>]*)>/gi)) {
        for (const attribute of match[1].matchAll(/\b(data-activity-[a-z-]+)(?=\s|=|$)/g)) {
            const node = new EventTarget();
            const attributes = new Map();
            node.setAttribute = (key, value) => attributes.set(key, value);
            node.getAttribute = (key) => attributes.get(key);
            node.textContent = "";
            nodes.set(attribute[1], node);
        }
    }
    const root = nodes.get("data-activity-ticker");
    assert.ok(root, "real wrapper includes the ticker");
    root.ownerDocument = page;
    root.dataset = {};
    root.style = {
        setProperty(key, value) {
            this[key] = value;
        }
    };
    root.querySelector = (selector) => nodes.get(selector.slice(1, -1));
    root.contains = (node) => [...nodes.values()].includes(node);
    const ticker = mountActivityTicker(root, {demo, settings: {...config, activityIntervalMs: 1000}});
    return {
        root, page, motion, frames, ticker,
        node: (name) => nodes.get(`data-activity-${name}`),
        tick(count = 1) {
            for (let n = 0; n < count; n++) {
                now += 100;
                const pending = [...frames.values()];
                frames.clear();
                for (const callback of pending) callback(now);
            }
        },
    };
}

function dispatch(target, type, properties = {}) {
    target.dispatchEvent(Object.assign(new Event(type), properties));
}

test("public messages use configured guidance; transactions require explicit demo mode", () => {
    const guide = getActivityItems({settings: {...config, minimumDeposit: 900}});
    assert.equal(guide[0].value, "₹900");
    assert.ok(guide.every((item) => item.kind === "info"));
    assert.ok(guide.every((item) => !/deposited|claimed|\*\*\*/i.test(`${item.primary} ${item.secondary}`)));
    const demo = getActivityItems({demo: true});
    assert.ok(demo.every((item) => item.badge === "DEMO"));
    assert.ok(new Set(demo.map((item) => item.value)).size > 1);
    assert.ok(new Set(demo.map((item) => item.primary)).size > 1);
    assert.ok(demo.some((item) => item.kind === "claim"));
});

test("ticker rotates actual wrapper bindings while retaining visible demo disclosure", () => {
    const state = fixture({demo: true});
    assert.equal(state.node("mode").textContent, "DEMO ACTIVITY");
    assert.match(state.node("note").textContent, /fictional/);
    assert.equal(state.node("primary").textContent, "R***21");
    state.tick(9);
    assert.equal(state.root.dataset.phase, "exiting");
    state.tick();
    assert.equal(state.root.dataset.phase, "away");
    assert.equal(state.node("primary").textContent, "R***21", "the old entry leaves before its replacement arrives");
    state.tick();
    assert.equal(state.root.dataset.phase, "entering");
    assert.equal(state.node("primary").textContent, "A***08");
    assert.equal(state.node("badge").textContent, "DEMO");
    assert.equal(state.node("mode").textContent, "DEMO ACTIVITY");
    assert.match(state.root.getAttribute("aria-label"), /fictional example/);
    state.ticker.destroy();
});

test("pointer, focus, and visibility pauses preserve independent pause reasons without controls", () => {
    const state = fixture();
    state.tick(4);
    dispatch(state.root, "pointerenter", {pointerType: "mouse"});
    state.tick(20);
    assert.equal(state.node("primary").textContent, "Minimum deposit");
    assert.equal(state.frames.size, 0);
    assert.equal(state.root.dataset.phase, "visible");
    dispatch(state.root, "focusin");
    dispatch(state.root, "pointerleave");
    assert.equal(state.frames.size, 0, "focus still pauses after pointer leaves");
    dispatch(state.root, "focusout", {relatedTarget: state.node("primary")});
    assert.equal(state.frames.size, 0, "moving focus within the ticker stays paused");
    dispatch(state.root, "focusout", {relatedTarget: null});
    assert.equal(state.frames.size, 1);
    state.page.hidden = true;
    dispatch(state.page, "visibilitychange");
    state.tick(30);
    assert.equal(state.node("primary").textContent, "Minimum deposit");
    assert.equal(state.frames.size, 0);
    state.page.hidden = false;
    dispatch(state.page, "visibilitychange");
    state.tick(8);
    assert.equal(state.node("primary").textContent, "Registration");
    state.ticker.destroy();
});

test("focusing the capsule during its empty gap restores a readable card", () => {
    const state = fixture();
    state.tick(10);
    assert.equal(state.root.dataset.phase, "away");
    dispatch(state.root, "focusin");
    assert.equal(state.root.dataset.phase, "visible");
    assert.equal(state.root.dataset.paused, "true");
    state.tick(20);
    assert.equal(state.node("primary").textContent, "Minimum deposit");
    dispatch(state.root, "focusout", {relatedTarget: null});
    state.tick(2);
    assert.equal(state.root.dataset.phase, "entering");
    assert.equal(state.node("primary").textContent, "Registration");
    state.ticker.destroy();
});

test("reduced motion stays static and cleanup cancels frames and event handlers", () => {
    const state = fixture({reduced: true});
    assert.equal(state.frames.size, 0);
    assert.equal(state.root.dataset.paused, "true");
    assert.equal(state.root.dataset.phase, "visible");
    state.tick(40);
    assert.equal(state.node("primary").textContent, "Minimum deposit");
    state.motion.matches = false;
    dispatch(state.motion, "change");
    assert.equal(state.frames.size, 1);
    assert.equal(state.root.dataset.paused, "false");
    state.ticker.destroy();
    assert.equal(state.frames.size, 0);
    dispatch(state.page, "visibilitychange");
    dispatch(state.root, "pointerleave");
    dispatch(state.motion, "change");
    assert.equal(state.frames.size, 0);
});
