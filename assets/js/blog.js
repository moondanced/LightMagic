(function () {
  "use strict";
  if (!window.LightMagicAccess || !window.LightMagicAccess.isUnlocked()) return;
  const dataScript = document.createElement("script");
  dataScript.src = "assets/js/blog-posts.js?v=20261116-2";
  dataScript.onload = () => {
    try { initialize(); }
    catch (error) {
      document.getElementById("resultCount").textContent = "文章加载失败，请刷新重试。";
      console.error("Blog initialization failed", error);
    }
  };
  dataScript.onerror = () => {
    document.getElementById("resultCount").textContent = "文章暂时无法加载，请刷新重试。";
  };
  document.head.appendChild(dataScript);

  function initialize() {
    const posts = window.BLOG_POSTS;
    if (!Array.isArray(posts)) throw new Error("Missing article data");
    function append(node, ...children) {
      children.forEach(child => node.appendChild(child));
    }
    function replaceChildren(node, children) {
      while (node.firstChild) node.removeChild(node.firstChild);
      children.forEach(child => node.appendChild(child));
    }
    const listView = document.getElementById("listView");
    const readerView = document.getElementById("readerView");
    const search = document.getElementById("searchInput");
    const list = document.getElementById("postList");
    let category = "全部";
    let listScroll = 0;
    let returnFocus = null;

    function element(tag, className, text) {
      const node = document.createElement(tag);
      node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }

    function openPost(post, trigger) {
      listScroll = window.scrollY;
      returnFocus = trigger;
      document.getElementById("articleTitle").textContent = post.title;
      document.getElementById("articleMeta").textContent = post.category + " / " + (post.label || "文章") + " · 约 " + Math.max(1, Math.ceil(post.paragraphs.join("").length / 300)) + " 分钟阅读";
      document.getElementById("articleByline").textContent = "P-1899 ／ " + (post.subtitle || (post.sample ? "示例文章" : "随笔"));
      let referenceIndex = 0;
      const content = (post.blocks || post.paragraphs.map(text => ({type: "paragraph", text}))).map(block => {
        if (block.type === "image") {
          const figure = element("figure", "article-figure");
          const image = element("img", "");
          image.src = block.src; image.alt = block.alt; image.width = 1000; image.height = 490;
          append(figure, image, element("figcaption", "", block.caption));
          return figure;
        }
        if (block.type === "reference") {
          const paragraph = element("p", "article-reference");
          paragraph.id = "reference-" + (++referenceIndex);
          const link = element("a", "", block.text);
          link.href = block.href; link.target = "_blank"; link.rel = "noopener noreferrer";
          paragraph.appendChild(link); return paragraph;
        }
        const node = element(block.type === "heading" ? "h2" : block.type === "subheading" ? "h3" : "p", "");
        const pattern = /\[(\d+)\]/g;
        let start = 0;
        let match;
        while ((match = pattern.exec(block.text)) !== null) {
          node.appendChild(document.createTextNode(block.text.slice(start, match.index)));
          const citation = element("a", "citation", "[" + match[1] + "]");
          citation.href = "#reference-" + match[1];
          citation.setAttribute("aria-label", "查看参考资料 " + match[1]);
          node.appendChild(citation);
          start = match.index + match[0].length;
        }
        node.appendChild(document.createTextNode(block.text.slice(start)));
        return node;
      });
      replaceChildren(document.getElementById("articleBody"), content);
      listView.hidden = true;
      readerView.hidden = false;
      document.title = post.title + " · P-1899 随笔";
      window.scrollTo(0, 0);
      document.getElementById("articleTitle").focus({ preventScroll: true });
    }

    function backToList() {
      readerView.hidden = true;
      listView.hidden = false;
      document.title = "随笔 · P-1899";
      if (returnFocus) returnFocus.focus({ preventScroll: true });
      window.requestAnimationFrame(() => window.scrollTo(0, listScroll));
    }

    function render() {
      const query = search.value.trim().toLocaleLowerCase();
      const filtered = posts.filter(post => (category === "全部" || category === post.category) &&
        [post.title, post.excerpt, post.category, ...post.paragraphs].join(" ").toLocaleLowerCase().includes(query));
      replaceChildren(list, []);
      filtered.forEach(post => {
        const article = element("article", "post");
        const meta = element("div", "post-meta", post.category + " / ");
        meta.appendChild(element("span", "sample-tag", post.label || (post.sample ? "示例" : "文章")));
        const heading = element("h2", "");
        const title = element("button", "post-title", post.title);
        title.type = "button";
        title.addEventListener("click", () => openPost(post, title));
        heading.appendChild(title);
        const read = element("button", "read-link", "阅读");
        read.type = "button";
        read.setAttribute("aria-label", "阅读：" + post.title);
        const arrow = element("span", "", "↗");
        arrow.setAttribute("aria-hidden", "true");
        read.appendChild(arrow);
        read.addEventListener("click", () => openPost(post, read));
        append(article, meta, heading, element("p", "post-excerpt", post.excerpt), read);
        list.appendChild(article);
      });
      document.getElementById("resultCount").textContent = String(filtered.length).padStart(2, "0") + " 篇";
      document.getElementById("emptyState").hidden = filtered.length > 0;
      document.querySelectorAll(".filter").forEach(button => {
        const selected = button.dataset.category === category;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    }
    document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
      category = button.dataset.category;
      render();
    }));
    search.addEventListener("input", render);
    document.getElementById("resetSearch").addEventListener("click", () => {
      category = "全部";
      search.value = "";
      render();
      search.focus();
    });
    document.getElementById("backButton").addEventListener("click", backToList);
    document.getElementById("bottomBackButton").addEventListener("click", backToList);
    render();
  }
})();
