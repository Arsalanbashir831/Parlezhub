export type BlogStatus = 'draft' | 'published';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  /** Markdown. Not always returned in lists. */
  content?: string;
  meta_description?: string;
  /** Image URL. */
  thumbnail?: string | null;
  category?: string | null;
  tags: string[];
  /** Comma-separated tags. */
  tag_list: string;
  status: BlogStatus;
  author_name: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  read_time: number;
  view_count: number;
  is_published: boolean;
}

export interface BlogListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogPost[];
}

export interface BlogListParams {
  page?: number;
  page_size?: number;
  status?: BlogStatus;
  search?: string;
}

/** What the composer submits; sent to the API as multipart form data. */
export interface BlogFormData {
  title: string;
  content: string;
  meta_description?: string;
  /** A new image to upload. Leave unset to keep the current one. */
  thumbnail?: File | null;
  tags: string[];
  status: BlogStatus;
}
