const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { TextEncoder } = require("node:util");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");

function loadAccessApi(initialHash = "") {
  const values = new Map();
  const window = {
    crypto: webcrypto,
    TextEncoder,
    location: {
      hash: initialHash,
      pathname: "/LightMagic/flow-preview-v1.html",
      search: ""
    },
    history: {
      replacedWith: null,
      replaceState(_state, _title, url) {
        this.replacedWith = url;
        window.location.hash = "";
      }
    },
    sessionStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); }
    }
  };

  const source = readFileSync(path.join(__dirname, "..", "assets", "js", "access.js"), "utf8");
  vm.runInNewContext(source, { TextEncoder, URLSearchParams, window });
  return { access: window.LightMagicAccess, source, window };
}

test("提取码规范化、验证和当前会话解锁", async () => {
  const code = process.env.ACCESS_TEST_CODE;
  assert.ok(code, "运行测试时需要通过 ACCESS_TEST_CODE 提供当前提取码");

  const { access } = loadAccessApi();
  assert.equal(access.isUnlocked(), false);
  assert.equal(access.normalizeCode(" ab 12 cd "), "AB12CD");
  assert.equal(await access.verify("WRONG1"), false);
  assert.equal(await access.verify(code.toLowerCase()), true);
  assert.equal(await access.verify(` ${code.slice(0, 3)} ${code.slice(3)} `), true);

  access.unlock();
  assert.equal(access.isUnlocked(), true);
});

test("NFC 凭据验证、地址清理和当前会话解锁", async () => {
  const token = process.env.NFC_TEST_TOKEN;
  assert.ok(token, "运行测试时需要通过 NFC_TEST_TOKEN 提供当前 NFC 凭据");

  const validContext = loadAccessApi(`#nfc=${encodeURIComponent(token)}`);
  assert.doesNotMatch(validContext.source, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  const validResult = await validContext.access.consumeNfcHash();
  assert.equal(validResult.present, true);
  assert.equal(validResult.valid, true);
  assert.equal(validResult.cardId, "nfc01");
  assert.equal(validContext.access.isUnlocked(), true);
  assert.equal(validContext.window.location.hash, "");
  assert.equal(validContext.window.history.replacedWith, "/LightMagic/flow-preview-v1.html");

  const changedLastCharacter = token.endsWith("A") ? `${token.slice(0, -1)}B` : `${token.slice(0, -1)}A`;
  const invalidContext = loadAccessApi(`#nfc=${encodeURIComponent(changedLastCharacter)}`);
  const invalidResult = await invalidContext.access.consumeNfcHash();
  assert.equal(invalidResult.present, true);
  assert.equal(invalidResult.valid, false);
  assert.equal(invalidContext.access.isUnlocked(), false);
  assert.equal(invalidContext.window.location.hash, "");

  const wrongCardContext = loadAccessApi("#nfc=nfc99.not-a-real-token");
  const wrongCardResult = await wrongCardContext.access.consumeNfcHash();
  assert.equal(wrongCardResult.present, true);
  assert.equal(wrongCardResult.valid, false);
  assert.equal(wrongCardResult.cardId, "nfc99");

  const missingContext = loadAccessApi();
  const missingResult = await missingContext.access.consumeNfcHash();
  assert.equal(missingResult.present, false);
  assert.equal(missingResult.valid, false);
  assert.equal(missingResult.cardId, null);
});
