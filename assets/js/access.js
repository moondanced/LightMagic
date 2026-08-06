(function () {
  "use strict";

  const STORAGE_KEY = "lightmagic.gallery.access.v1";
  const ACCESS_SALT = "2c2d282b530f65e5d4d6c8a10053a42a";
  const ACCESS_DIGEST = "997b175f898dfc1652a70af39eaaffc66f6399bc3ac254d88db6714dce53446e";

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

  function unlock() {
    if (!writeSession(ACCESS_DIGEST)) {
      throw new Error("浏览器无法保存当前标签页的解锁状态，请检查隐私设置。");
    }
  }

  window.LightMagicAccess = Object.freeze({
    isUnlocked,
    normalizeCode,
    unlock,
    verify
  });
})();
