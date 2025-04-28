import { create } from "zustand";

// Mock blog data for demonstration
const MOCK_BLOGS = [
  {
    id: "1",
    title: "The Future of Artificial Intelligence",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultricies, nunc nisl ultricies nunc, quis ultricies nisl nisl quis nisl.",
    status: "published",
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-05-15T14:20:00Z",
    userId: "1",
    imageUrl:
      "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    excerpt: "Exploring the future implications of AI technology",
    tags: ["AI", "Technology", "Future"],
    wordCount: 1200,
  },
  {
    id: "2",
    title: "Sustainable Living: A Complete Guide",
    content:
      "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.",
    status: "draft",
    createdAt: "2023-06-02T09:15:00Z",
    updatedAt: "2023-06-03T11:40:00Z",
    userId: "1",
    imageUrl:
      "https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    excerpt: "Practical tips for sustainable living in the modern world",
    tags: ["Sustainability", "Lifestyle", "Environment"],
    wordCount: 1800,
  },
  {
    id: "3",
    title: "Mastering Remote Work: Tips and Strategies",
    content:
      "Curabitur aliquet quam id dui posuere blandit. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.",
    status: "published",
    createdAt: "2023-06-10T15:45:00Z",
    updatedAt: "2023-06-12T08:30:00Z",
    userId: "1",
    imageUrl:
      "https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    excerpt: "Working remotely can be challenging, here's how to master it",
    tags: ["Remote Work", "Productivity", "Lifestyle"],
    wordCount: 1500,
  },
];

export const useBlogStore = create((set, get) => ({
  blogs: [],
  currentBlog: null,
  isLoading: false,
  error: null,

  fetchBlogs: async () => {
    set({ isLoading: true });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    set({
      blogs: MOCK_BLOGS,
      isLoading: false,
    });
  },

  fetchBlog: async (id) => {
    set({ isLoading: true });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const blog = MOCK_BLOGS.find((blog) => blog.id === id);

    if (blog) {
      set({
        currentBlog: blog,
        isLoading: false,
      });
    } else {
      set({
        error: "Blog not found",
        isLoading: false,
      });
    }
  },

  createBlog: async (blogData) => {
    set({ isLoading: true });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newBlog = {
      id: `${Math.floor(Math.random() * 1000)}`,
      title: blogData.title || "Untitled Blog",
      content: blogData.content || "",
      status: blogData.status || "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "1",
      imageUrl: blogData.imageUrl,
      excerpt: blogData.excerpt,
      tags: blogData.tags,
      wordCount: blogData.content?.split(" ").length || 0,
    };

    set((state) => ({
      blogs: [...state.blogs, newBlog],
      currentBlog: newBlog,
      isLoading: false,
    }));
  },

  updateBlog: async (id, blogData) => {
    set({ isLoading: true });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    set((state) => {
      const updatedBlogs = state.blogs.map((blog) =>
        blog.id === id
          ? { ...blog, ...blogData, updatedAt: new Date().toISOString() }
          : blog
      );

      return {
        blogs: updatedBlogs,
        currentBlog: updatedBlogs.find((blog) => blog.id === id) || null,
        isLoading: false,
      };
    });
  },

  deleteBlog: async (id) => {
    set({ isLoading: true });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    set((state) => ({
      blogs: state.blogs.filter((blog) => blog.id !== id),
      isLoading: false,
    }));
  },

  generateBlog: async (topic, options) => {
    set({ isLoading: true });

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock AI generation (in a real app, this would call an AI service)
    const generatedContent = `
    # ${topic}

    ## Introduction

    This is a generated blog post about ${topic}. The tone is ${options.tone} and the length is ${options.length}.

    ## Main Points

    1. First important point about ${topic}
    2. Second important point with detailed analysis
    3. Insights and industry trends

    ## Practical Applications

    Here are some ways to apply these insights in real-world scenarios...

    ## Conclusion

    In summary, ${topic} represents a significant opportunity/challenge that requires attention.
    `;

    const wordCount =
      options.length === "short"
        ? 800
        : options.length === "medium"
        ? 1500
        : 2500;

    const newBlog = {
      id: `${Math.floor(Math.random() * 1000)}`,
      title: topic,
      content: generatedContent,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "1",
      imageUrl:
        "https://images.pexels.com/photos/270373/pexels-photo-270373.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      excerpt: `An exploration of ${topic} with key insights and analysis.`,
      tags: [topic.split(" ")[0], "AI Generated"],
      wordCount,
    };

    set((state) => ({
      blogs: [...state.blogs, newBlog],
      currentBlog: newBlog,
      isLoading: false,
    }));
  },
}));
