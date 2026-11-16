const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const root = path.join(__dirname, "..");

test("缺少较新 DOM 接口的移动浏览器也能显示列表并打开全文", () => {
  class Node {
    constructor() {
      this.children = []; this.listeners = {}; this.value = ""; this.dataset = {};
      this.classList = { toggle() {} };
    }
    get firstChild() { return this.children[0]; }
    appendChild(child) { this.children.push(child); return child; }
    removeChild(child) { this.children.splice(this.children.indexOf(child), 1); }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    setAttribute() {}
    focus() {}
  }
  const nodes = {};
  const document = {
    getElementById(id) { return nodes[id] || (nodes[id] = new Node()); },
    createElement() { return new Node(); },
    createTextNode(text) { return { textContent: text }; },
    querySelectorAll() { return []; },
    head: new Node()
  };
  const window = { LightMagicAccess: { isUnlocked: () => true }, scrollTo() {}, scrollY: 0 };
  const context = vm.createContext({ window, document, console });
  vm.runInContext('String.prototype.matchAll = undefined;', context);
  vm.runInContext(readFileSync(path.join(root, "assets/js/blog-posts.js"), "utf8"), context);
  vm.runInContext(readFileSync(path.join(root, "assets/js/blog.js"), "utf8"), context);
  document.head.firstChild.onload();
  assert.equal(nodes.postList.children.length, 1);
  assert.equal(nodes.resultCount.textContent, "01 篇");
  const title = nodes.postList.firstChild.children[1].firstChild;
  title.listeners.click();
  assert.equal(nodes.articleTitle.textContent, "21世纪碳基人类生存要素");
  assert.equal(nodes.readerView.hidden, false);
  assert.ok(nodes.articleBody.children.length > 20);
  assert.ok(nodes.articleBody.children.some(node => node.id === "reference-10"));
});

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
