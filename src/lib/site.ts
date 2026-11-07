import { getCollection } from 'astro:content';

export const repository = 'https://github.com/At-PetAdmin/At-Pet';
export const sections = ['开始使用', '桌宠指南', 'Agent 与开发'] as const;
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (path = '') => `${base}/${path.replace(/^\//, '')}`;
export const docUrl = (id: string) => url(`docs/${id}/`);
export const getDocs = async () => (await getCollection('docs')).sort((a, b) => a.data.order - b.data.order);
