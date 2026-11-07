import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(['开始使用', '桌宠指南', 'Agent 与开发']),
    order: z.number(),
    source: z.string().url(),
  }),
});

export const collections = { docs };
