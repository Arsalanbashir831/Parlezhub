import type { BlogFormData, BlogPost } from '@/types/blog';

const STORAGE_KEY = 'teacher_blogs_v1';

function readAll(): BlogPost[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as BlogPost[]) : [];
}

function writeAll(list: BlogPost[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const blogService = {
  list: async (): Promise<BlogPost[]> => {
    return readAll();
  },
  seedIfEmpty: async () => {
    const all = readAll();
    if (all.length) return;
    const now = new Date().toISOString();
    const sample: BlogPost[] = [
      {
        id: crypto.randomUUID(),
        title: 'How to Prepare for Your First Language Lesson',
        slug: 'prepare-first-language-lesson',
        content: '<p>Here are my top tips for your first lesson...</p>',
        thumbnail: '/placeholders/avatar.jpg',
        status: 'published',
        createdAt: now,
        updatedAt: now,
        tags: ['tips', 'beginner'],
      },
      {
        id: crypto.randomUUID(),
        title: 'Pronunciation Drills That Actually Work',
        slug: 'pronunciation-drills-that-work',
        content: '<p>These drills will help you practice daily...</p>',
        thumbnail: '/placeholders/avatar.jpg',
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        tags: ['pronunciation'],
      },
    ];
    writeAll(sample);
  },
  create: async (data: BlogFormData): Promise<BlogPost> => {
    const all = readAll();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const post: BlogPost = {
      id,
      title: data.title,
      slug,
      content: data.content,
      thumbnail: data.thumbnail,
      tags: data.tags || [],
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };
    all.unshift(post);
    writeAll(all);
    return post;
  },
  get: async (id: string): Promise<BlogPost | null> => {
    const all = readAll();
    return all.find((b) => b.id === id) || null;
  },
  update: async (
    id: string,
    data: Partial<BlogFormData>
  ): Promise<BlogPost | null> => {
    const all = readAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    const updated: BlogPost = {
      ...all[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    } as BlogPost;
    all[idx] = updated;
    writeAll(all);
    return updated;
  },
  remove: async (id: string): Promise<void> => {
    writeAll(readAll().filter((b) => b.id !== id));
  },
  setStatus: async (
    id: string,
    status: BlogPost['status']
  ): Promise<BlogPost | null> => {
    const all = readAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], status, updatedAt: new Date().toISOString() };
    writeAll(all);
    return all[idx];
  },
};

export default blogService;
