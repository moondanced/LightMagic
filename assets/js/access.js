(function () {
  "use strict";

  const STORAGE_KEY = "lightmagic.gallery.access.v1";
  const ACCESS_SALT = "2c2d282b530f65e5d4d6c8a10053a42a";
  const ACCESS_DIGEST = "997b175f898dfc1652a70af39eaaffc66f6399bc3ac254d88db6714dce53446e";
  const NFC_CARDS = Object.freeze({
    nfc01: Object.freeze({
      salt: "469cbf6172de8797f2726506fbe80429",
      digest: "5c096c739d2d9f9c95d5c06d0310932689135d8bc03755e6556ce2cc066c6971"
    })
  });

  function normalizeCode(value) {
    return String(value || "").replace(/\s+/g, "").toUpperCase();
  }

  async function sha256(value) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      throw new Error("当前浏览器不支持安全摘要校验，请升级浏览器后重试。");
    }

    const bytes = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function readSession() {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function writeSession(value) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function isUnlocked() {
    return readSession() === ACCESS_DIGEST;
  }

  async function verify(code) {
    const normalizedCode = normalizeCode(code);
    if (!normalizedCode) return false;
    return (await sha256(ACCESS_SALT + normalizedCode)) === ACCESS_DIGEST;
  }

  function equalHex(left, right) {
    if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length) {
      return false;
    }

    let difference = 0;
    for (let index = 0; index < left.length; index += 1) {
      difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
    }
    return difference === 0;
  }

  function parseNfcToken(token) {
    const parts = String(token || "").split(".");
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    return { cardId: parts[0], token: String(token) };
  }

  async function verifyNfcToken(token) {
    const parsed = parseNfcToken(token);
    if (!parsed) return { cardId: null, valid: false };

    const card = NFC_CARDS[parsed.cardId];
    if (!card) return { cardId: parsed.cardId, valid: false };

    const digest = await sha256(card.salt + parsed.token);
    return { cardId: parsed.cardId, valid: equalHex(digest, card.digest) };
  }

  function clearLocationHash() {
    try {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", cleanUrl);
    } catch (error) {
      // Access remains valid even if a restrictive browser prevents history updates.
    }
  }

  async function consumeNfcHash() {
    const hash = window.location && typeof window.location.hash === "string"
      ? window.location.hash.slice(1)
      : "";
    const params = new URLSearchParams(hash);

    if (!params.has("nfc")) {
      return { present: false, valid: false, cardId: null };
    }

    const token = params.get("nfc") || "";
    clearLocationHash();

    const result = await verifyNfcToken(token);
    if (result.valid) unlock();

    return { present: true, valid: result.valid, cardId: result.cardId };
  }

  function unlock() {
    if (!writeSession(ACCESS_DIGEST)) {
      throw new Error("浏览器无法保存当前标签页的解锁状态，请检查隐私设置。");
    }
  }

  window.LightMagicAccess = Object.freeze({
    isUnlocked,
    consumeNfcHash,
    normalizeCode,
    unlock,
    verify
  });
})();
