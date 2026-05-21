# 瀑布流照片墙样例

这是一个纯静态的瀑布流照片网页样例，适合用于：

1. 摄影作品集
2. 旅行相册
3. 生活照片墙
4. 项目展示页
5. GitHub Pages 静态网页演示

当前样例不依赖 React、Vue、Node.js、npm 或任何构建工具。核心页面只有一个 `index.html`，可以直接作为静态网页发布。

## 目录结构

```text
examples/waterfall-gallery/
├── index.html
├── README.md
└── assets/
    └── images/
        └── .gitkeep
```

各文件说明：

```text
index.html
```

瀑布流照片墙的主页面，包含 HTML、CSS 和 JavaScript。页面布局、筛选按钮、搜索框、加载更多功能都在这个文件中。

```text
README.md
```

当前说明文档，记录这个样例的使用方式、维护方式和发布方式。

```text
assets/images/
```

建议存放真实照片的目录。当前目录里只有 `.gitkeep`，用于让 Git 记录这个空目录。

## 当前功能

1. 响应式瀑布流布局
2. 手机、平板、桌面端自适应显示
3. 图片分类筛选
4. 标题和分类搜索
5. 图片懒加载
6. 鼠标悬停放大图片
7. 鼠标悬停显示图片标题和分类
8. 加载更多照片按钮
9. 无需任何前端构建环境

## 如何修改照片

打开：

```text
examples/waterfall-gallery/index.html
```

找到下面这一段：

```js
const photos = [
  { id: 1, title: "海边日落", category: "风景", src: "https://picsum.photos/id/1018/900/1200" },
  { id: 2, title: "城市漫步", category: "城市", src: "https://picsum.photos/id/1031/900/700" }
];
```

每一张照片对应一个对象：

```js
{
  id: 1,
  title: "海边日落",
  category: "风景",
  src: "https://picsum.photos/id/1018/900/1200"
}
```

字段含义：

```text
id
```

照片编号。每张照片建议使用不同的数字，例如 `1`、`2`、`3`。

```text
title
```

照片标题，会在鼠标悬停图片时显示。

```text
category
```

照片分类，用于上方分类按钮筛选。

```text
src
```

图片地址。可以是网络图片地址，也可以是仓库中的本地图片路径。

## 推荐的图片管理方式

建议把真实照片上传到：

```text
examples/waterfall-gallery/assets/images/
```

例如上传这些文件：

```text
examples/waterfall-gallery/assets/images/photo-01.jpg
examples/waterfall-gallery/assets/images/photo-02.jpg
examples/waterfall-gallery/assets/images/photo-03.jpg
```

然后在 `index.html` 中这样引用：

```js
const photos = [
  { id: 1, title: "我的照片 1", category: "旅行", src: "assets/images/photo-01.jpg" },
  { id: 2, title: "我的照片 2", category: "生活", src: "assets/images/photo-02.jpg" },
  { id: 3, title: "我的照片 3", category: "风景", src: "assets/images/photo-03.jpg" }
];
```

注意：路径是相对于 `index.html` 的路径。因为 `index.html` 位于 `examples/waterfall-gallery/`，所以图片路径写成：

```text
assets/images/photo-01.jpg
```

不要写成：

```text
examples/waterfall-gallery/assets/images/photo-01.jpg
```

## 如何在 GitHub 网页端上传图片

在 GitHub 仓库页面中：

1. 进入 `examples/waterfall-gallery/assets/images/`
2. 点击 `Add file`
3. 点击 `Upload files`
4. 拖入图片文件
5. 点击 `Commit changes`

上传完成后，回到 `index.html`，把 `photos` 数组中的 `src` 改为对应文件路径。

## 如何新增一张照片

假设你上传了一张图片：

```text
examples/waterfall-gallery/assets/images/travel-01.jpg
```

可以在 `photos` 数组中新增一项：

```js
{ id: 19, title: "旅行照片 01", category: "旅行", src: "assets/images/travel-01.jpg" }
```

完整示例：

```js
const photos = [
  { id: 1, title: "海边日落", category: "风景", src: "assets/images/photo-01.jpg" },
  { id: 2, title: "城市漫步", category: "城市", src: "assets/images/photo-02.jpg" },
  { id: 19, title: "旅行照片 01", category: "旅行", src: "assets/images/travel-01.jpg" }
];
```

## 如何修改分类

打开 `index.html`，找到：

```js
const categories = ["全部", "风景", "城市", "人像", "生活"];
```

如果想改成自己的分类，例如：

```js
const categories = ["全部", "旅行", "校园", "科研", "生活"];
```

那么照片数据中的 `category` 也要对应修改：

```js
const photos = [
  { id: 1, title: "北京旅行", category: "旅行", src: "assets/images/beijing-01.jpg" },
  { id: 2, title: "校园一角", category: "校园", src: "assets/images/campus-01.jpg" },
  { id: 3, title: "会议记录", category: "科研", src: "assets/images/research-01.jpg" }
];
```

分类按钮和照片的 `category` 必须一致，否则筛选时可能找不到照片。

## 如何修改页面标题

浏览器标签页标题在这里修改：

```html
<title>瀑布流照片墙样例</title>
```

页面主标题在这里修改：

```html
<h1>瀑布流照片墙</h1>
```

页面说明文字在这里修改：

```html
<p class="intro">
  一个适合摄影作品集、旅行相册、生活记录的响应式瀑布流网页。
</p>
```

## 如何修改颜色和样式

主要颜色集中在 `:root` 中：

```css
:root {
  --bg: #09090b;
  --panel: rgba(255, 255, 255, 0.06);
  --panel-strong: rgba(255, 255, 255, 0.1);
  --border: rgba(255, 255, 255, 0.12);
  --text: #f5f5f5;
  --muted: #d4d4d8;
  --muted-2: #9ca3af;
  --dark: #111827;
  --white: #ffffff;
}
```

常见修改：

1. 想换浅色背景：修改 `body` 的 `background`。
2. 想改卡片圆角：修改 `.photo-card` 的 `border-radius`。
3. 想改一行显示几列：修改 `.gallery` 的 `column-count`。
4. 想改图片间距：修改 `.gallery` 的 `column-gap` 和 `.photo-card` 的 `margin-bottom`。

桌面端列数在这里：

```css
.gallery {
  column-count: 4;
}
```

平板端列数在这里：

```css
@media (max-width: 1100px) {
  .gallery {
    column-count: 3;
  }
}
```

手机端列数在这里：

```css
@media (max-width: 760px) {
  .gallery {
    column-count: 2;
  }
}
```

小屏手机列数在这里：

```css
@media (max-width: 480px) {
  .gallery {
    column-count: 1;
  }
}
```

## 如何预览这个页面

### 方法一：下载仓库后本地打开

如果你把仓库下载到电脑，可以直接双击：

```text
examples/waterfall-gallery/index.html
```

浏览器会直接打开网页。

### 方法二：发布到 GitHub Pages

如果想让别人通过网址访问，需要使用 GitHub Pages。

当前样例位于：

```text
examples/waterfall-gallery/index.html
```

如果 GitHub Pages 发布源选择仓库根目录，则访问路径通常是：

```text
https://你的用户名.github.io/仓库名/examples/waterfall-gallery/
```

对于当前仓库，理论路径形式是：

```text
https://moondanced.github.io/CodeX-Moondance/examples/waterfall-gallery/
```

注意：当前仓库是 private。private 仓库是否能直接使用 GitHub Pages，取决于你的 GitHub 计划和仓库设置。最稳妥的公开发布方式是新建一个 public 仓库，然后把这个样例目录中的文件复制过去。

## 推荐的正式发布方式

如果最终只是为了发布照片墙，建议新建一个独立 public 仓库，例如：

```text
photo-gallery
```

然后把下面这些内容放到新仓库根目录：

```text
index.html
assets/images/
```

最终结构建议为：

```text
photo-gallery/
├── index.html
└── assets/
    └── images/
        ├── photo-01.jpg
        ├── photo-02.jpg
        └── photo-03.jpg
```

这样 GitHub Pages 地址通常是：

```text
https://moondanced.github.io/photo-gallery/
```

## 常见问题

### 图片不显示怎么办？

检查以下几点：

1. 图片是否已经上传到 `assets/images/`。
2. 文件名是否完全一致，包括大小写。
3. `src` 路径是否写成 `assets/images/xxx.jpg`。
4. 图片文件扩展名是否正确，例如 `.jpg`、`.jpeg`、`.png`、`.webp`。
5. 文件名中尽量不要使用中文、空格或特殊符号。

推荐命名方式：

```text
photo-01.jpg
travel-2026-01.jpg
campus-view-01.png
```

不推荐命名方式：

```text
我的照片 1.jpg
photo 1.jpg
IMG(1).jpg
```

### 分类筛选不生效怎么办？

检查 `categories` 和 `photos` 中的 `category` 是否完全一致。

例如分类是：

```js
const categories = ["全部", "旅行", "生活"];
```

照片就应该写：

```js
{ id: 1, title: "照片", category: "旅行", src: "assets/images/photo-01.jpg" }
```

不要写成：

```js
{ id: 1, title: "照片", category: "旅游", src: "assets/images/photo-01.jpg" }
```

因为 `旅行` 和 `旅游` 是两个不同分类。

### 为什么 GitHub 页面里看到的是代码，不是网页？

在 GitHub 仓库中直接点击 `index.html`，GitHub 默认显示源代码，不会像普通网站一样渲染网页。

要看到网页效果，需要：

1. 下载后用浏览器打开；或者
2. 使用 GitHub Pages 发布；或者
3. 将文件放到可以托管静态网页的平台。

### 可以继续拆成多个文件吗？

可以。当前为了方便 GitHub Pages 快速使用，把 HTML、CSS、JavaScript 都放在一个 `index.html` 中。

后续可以拆分成：

```text
index.html
assets/css/style.css
assets/js/main.js
assets/images/
```

适合照片数量较多、页面需要长期维护的情况。

## 后续可扩展功能

后续可以继续添加：

1. 点击图片放大预览
2. 图片左右切换
3. 图片下载按钮
4. 图片日期和地点信息
5. 自动读取 JSON 文件中的照片数据
6. 多相册页面
7. 明暗主题切换
8. GitHub Actions 自动部署

## 维护原则

建议保持这个样例目录独立：

```text
examples/waterfall-gallery/
```

不要把照片墙相关文件分散到仓库其他目录中。这样后续迁移、复制、发布和删除都更容易。