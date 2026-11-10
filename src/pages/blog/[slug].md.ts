import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';

// /blog/<slug>.md: the post as plain Markdown, for AI agents and crawlers
// that ask for it. Same drafts rule as the HTML page in [...slug].astro.
export const getStaticPaths = (async () => {
  const isDev = import.meta.env.DEV;
  const posts = await getCollection('blog', ({ data }) => isDev || data.status === 'published');
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const { post } = props as { post: Awaited<ReturnType<typeof getCollection<'blog'>>>[number] };
  const { title, date, description } = post.data;
  const canonical = new URL(`/blog/${post.id}/`, site ?? 'https://tn07.dev');
  const header = [`# ${title}`, '', `${date} - Tejas Nafde${description ? `. ${description}` : ''}`, '', `Canonical: ${canonical}`, ''];
  return new Response(`${header.join('\n')}\n${post.body ?? ''}`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
