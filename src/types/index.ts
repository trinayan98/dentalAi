// Auth types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  setNewPassword: (password: string, token: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

// Blog types
export interface Blog {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  userId: string;
  imageUrl?: string;
  excerpt?: string;
  tags?: string[];
  wordCount?: number;
}

export interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  isLoading: boolean;
  error: string | null;
  fetchBlogs: () => Promise<void>;
  fetchBlog: (id: string) => Promise<void>;
  createBlog: (blogData: Partial<Blog>) => Promise<void>;
  updateBlog: (id: string, blogData: Partial<Blog>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  generateBlog: (topic: string, options: GenerationOptions) => Promise<void>;
}

export interface GenerationOptions {
  tone: 'professional' | 'casual' | 'formal' | 'friendly';
  length: 'short' | 'medium' | 'long';
  targetAudience?: string;
  includeImages?: boolean;
}

// Dashboard types
export interface DashboardStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalWordCount: number;
}

// Toast types
export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// Theme
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}