export type BlogStatus = 'draft' | 'published';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content?: string; // Markdown content (not always returned in list)
  meta_description?: string; // SEO meta description
  thumbnail?: string; // Image URL or path
  category?: string | null;
  tags: string[]; // Array of tags
  tag_list: string; // Comma-separated tags string
  status: BlogStatus;
  author_name: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  read_time: number;
  view_count: number;
  is_published: boolean;
}

// API Response structure
export interface BlogListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogPost[];
}

export interface BlogFormData {
  title: string;
  content: string; // Markdown content
  meta_description?: string; // SEO meta description
  thumbnail?: File | null; // Image file for upload
  tags: string[]; // Array of tags
  status: BlogStatus;
}

// For API requests - will be sent as FormData
export interface BlogApiRequest {
  title: string;
  content: string; // Markdown content
  meta_description?: string;
  thumbnail?: File; // Image file
  tags: string; // JSON stringified array
  status: BlogStatus;
}
