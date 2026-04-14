import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // blog-writer fields
    timeframe: z.string().optional(),
    batch_key: z.string().optional(),
    batch_mode: z.string().optional(),
    repos: z.array(z.string()).optional(),
    commit_count: z.number().optional(),
    // draft support
    status: z.enum(['draft', 'published']).default('published'),
  }),
});

export const collections = { blog };
