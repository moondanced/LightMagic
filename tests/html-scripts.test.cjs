const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

for (const filename of ["index.html", "gallery.html", "flow-preview-v1.html"]) {
  test(`${filename} 的内联脚本语法有效`, () => {
    const html = readFileSync(path.join(__dirname, "..", filename), "utf8");
    const scripts = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi));

    for (const match of scripts) {
      if (!match[1].trim()) continue;
      Function(match[1]);
    }
  });
}

test("锁定入口不包含静态照片或音频元素", () => {
  const html = readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(html, /id="accessForm"/);
  assert.doesNotMatch(html, /<img\b/i);
  assert.doesNotMatch(html, /<audio\b/i);
});

test("相册门禁在页面正文解析前执行", () => {
  const html = readFileSync(path.join(__dirname, "..", "gallery.html"), "utf8");
  const guardPosition = html.indexOf("LightMagicAccess.isUnlocked()");
  assert.ok(guardPosition > 0);
  assert.ok(guardPosition < html.indexOf("<body>"));
  assert.match(html, /class="access-checking"/);
});

test("旧版流动预览在门禁通过前不加载照片清单", () => {
  const html = readFileSync(path.join(__dirname, "..", "flow-preview-v1.html"), "utf8");
  const accessPosition = html.indexOf("flowPreviewAccessReady");
  const bodyPosition = html.indexOf("<body>");
  const awaitPosition = html.indexOf("await window.flowPreviewAccessReady");
  const catalogPosition = html.indexOf('catalog.src = "assets/js/photos-flow-preview-v1.js"');

  assert.ok(accessPosition > 0 && accessPosition < bodyPosition);
  assert.ok(awaitPosition > bodyPosition && awaitPosition < catalogPosition);
  assert.match(html, /class="access-checking"/);
  assert.match(html, /noindex, nofollow, noarchive/);
  assert.doesNotMatch(html, /<script[^>]+src="assets\/js\/photos-flow-preview-v1\.js"/i);
  assert.doesNotMatch(html, /<img\b[^>]*\bsrc=/i);
});

test("密码入口只允许返回已知页面", () => {
  const html = readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(html, /new Set\(\["gallery\.html", "flow-preview-v1\.html"\]\)/);
  assert.match(html, /window\.location\.assign\(returnTarget\)/);
  assert.match(html, /NFC 通行链接无效或已失效/);
});
