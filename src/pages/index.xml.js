import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: "aryaman.space",
    description:
      "Aryaman Gupta's engineering blog — deep dives into Python internals, distributed systems, NLP, and the papers worth reading twice.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
      content: post.rendered?.html,
    })),
    customData: "<language>en</language>",
  });
}
