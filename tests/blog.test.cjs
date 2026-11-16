const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const root = path.join(__dirname, "..");

test("未解锁博客回到现有提取码入口，且不加载文章", () => {
  const html = readFileSync(path.join(root, "blog.html"), "utf8");
  const guard = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].find(match => match[1].trim())[1];
  let redirect;
  const window = { LightMagicAccess: { isUnlocked: () => false }, location: { replace: value => { redirect = value; } } };
  vm.runInNewContext(guard, { window });
  assert.equal(redirect, "index.html?locked=1&next=blog.html");
  // Any DOM access or data-script creation while locked would fail here.
  vm.runInNewContext(readFileSync(path.join(root, "assets/js/blog.js"), "utf8"), { window });
  assert.doesNotMatch(html, /<script[^>]+src="assets\/js\/blog-posts\.js"/);
});

test("已解锁的博客延用会话，不再次请求提取码", () => {
  const html = readFileSync(path.join(root, "blog.html"), "utf8");
  const guard = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].find(match => match[1].trim())[1];
  let visible = false;
  const window = { LightMagicAccess: { isUnlocked: () => true }, location: { replace: () => assert.fail("Unexpected redirect") } };
  vm.runInNewContext(guard, { window, document: { documentElement: { classList: { remove: value => { visible = value === "access-checking"; } } } } });
  assert.equal(visible, true);
});
