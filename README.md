# aryaman.space

Source for [aryaman.space](https://aryaman.space) — a minimal blog built with [Astro](https://astro.build) and deployed to GitHub Pages automatically via GitHub Actions.

## Writing a new post

Create a markdown file in `src/content/blog/` — the filename becomes the URL (`my-new-post.md` → `aryaman.space/blog/my-new-post/`):

```markdown
---
title: "My New Post"
date: 2026-07-13
description: "One-line summary shown on the homepage and in search results."
tags: ["python", "asyncio"]
---

Your content here. Regular markdown — code blocks get syntax
highlighting automatically, and headings build the table of contents.
```

Add `draft: true` to the front matter to keep a post unpublished.

Put images in `public/images/<post-name>/` and reference them as `/images/<post-name>/image1.png`.

Then commit and push — GitHub Actions builds and deploys the site automatically:

```
git add . && git commit -m "New post" && git push
```

## Running locally (optional)

Requires [Node.js](https://nodejs.org) 20+. You don't need this to publish — pushing to `main` is enough.

```
npm install
npm run dev      # live preview at http://localhost:4321
npm run build    # production build into dist/
```

## How deployment works

`.github/workflows/deploy.yml` runs on every push to `main`: it builds the site with Astro and publishes it to GitHub Pages (Settings → Pages → Source must be set to **GitHub Actions**). The custom domain is set by `public/CNAME`.

## Structure

```
src/content/blog/   ← blog posts (markdown)
src/pages/          ← standalone pages (about, papershelf), RSS, 404
src/layouts/        ← page shells (header/footer/head)
src/styles/         ← the design system (global.css)
public/             ← images, videos, favicon, CNAME
```
