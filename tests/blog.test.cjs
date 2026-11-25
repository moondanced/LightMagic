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
  assert.equal(nodes.postList.children.length, window.BLOG_POSTS.length);
  assert.equal(nodes.resultCount.textContent, String(window.BLOG_POSTS.length).padStart(2, "0") + " 篇");
  const original = nodes.postList.children.find(node => node.children[1].firstChild.textContent === "21世纪碳基人类生存要素");
  const title = original.children[1].firstChild;
  title.listeners.click();
  assert.equal(nodes.articleTitle.textContent, "21世纪碳基人类生存要素");
  assert.equal(nodes.readerView.hidden, false);
  assert.ok(nodes.articleBody.children.length > 20);
  assert.ok(nodes.articleBody.children.some(node => node.id === "reference-10"));
  const added = nodes.postList.children.find(node => node.children[1].firstChild.textContent === "科技资本化与政治权力资本化");
  added.children[1].firstChild.listeners.click();
  assert.equal(nodes.articleTitle.textContent, "科技资本化与政治权力资本化");
  const references = nodes.articleBody.children.filter(node => node.id && node.id.startsWith("reference-"));
  assert.equal(references.length, 31);
  const headings = nodes.articleBody.children.filter(node => node.className === "" && typeof node.textContent === "string").map(node => node.textContent);
  const publishedBlocks = window.BLOG_POSTS.find(post => post.id === "technology-capital-power").blocks;
  const headingTexts = publishedBlocks.filter(block => block.type === "heading").map(block => block.text);
  assert.equal(headingTexts.indexOf("作为生产要素的技术") + 1, headingTexts.indexOf("技术成为生产要素之后"));
  const referenceIds = new Set(references.map(node => node.id));
  const citations = nodes.articleBody.children.flatMap(node => node.children || []).filter(node => node.className === "citation");
  assert.ok(citations.length > 20);
  assert.ok(citations.every(node => referenceIds.has(node.href.slice(1))));
  assert.ok(references.find(node => node.id === "reference-12").firstChild.href.includes("ri.se"));
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
