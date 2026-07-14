// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// add loading="lazy" / decoding="async" to every markdown image
function rehypeLazyImages() {
  const visit = (node) => {
    if (node.tagName === "img") {
      node.properties = {
        ...node.properties,
        loading: "lazy",
        decoding: "async",
      };
    }
    for (const child of node.children ?? []) visit(child);
  };
  return (tree) => visit(tree);
}

export default defineConfig({
  site: "https://aryaman.space",
  trailingSlash: "always",
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeLazyImages],
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    },
  },
});
