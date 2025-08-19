export type BlogStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML from editor
  thumbnail?: string; // data URL or path
  status: BlogStatus;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogFormData {
  title: string;
  content: string; // HTML
  thumbnail?: string; // data URL or path
  tags?: string[];
  status: BlogStatus;
}
