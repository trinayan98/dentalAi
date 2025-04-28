import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Search,
  Calendar,
  Tag,
  MoreVertical,
  FileEdit,
  Copy,
  Trash,
  Download,
  Eye,
  List,
  Grid,
  Clock,
  ChevronRight,
  Edit,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useBlogStore } from "../../stores/blogStore";
import { useToastStore } from "../../stores/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
export default function BlogList() {
  const navigate = useNavigate();
  const { blogs, fetchBlogs, deleteBlog, isLoading } = useBlogStore();
  const { addToast } = useToastStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeDropdown]);

  const handleDeleteBlog = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteBlog(id);
        addToast({
          title: "Blog deleted",
          description: "The blog post has been permanently deleted",
          type: "success",
        });
      } catch (error) {
        addToast({
          title: "Delete failed",
          description:
            error instanceof Error
              ? error.message
              : "Could not delete the blog post",
          type: "error",
        });
      }
    }
  };

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Filter and sort blogs
  const filteredBlogs = blogs
    .filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.content &&
          blog.content.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" || blog.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 ">My Blogs</span>{" "}
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>

      {/* Header & Actions */}
      {/* <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Blogs
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your blog posts
            </p>
          </div>
        </div>
      </div> */}

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="w-full lg:w-72">
          <Input
            placeholder="Search blogs..."
            leftIcon={<Search className="h-4 w-4 text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 border-0 w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)]">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Status :
            </span>
            <select
              className="bg-transparent border-0 text-xxs text-gray-900 focus:outline-none focus:ring-0 cursor-pointer px-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)]">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Sort by :
            </span>
            <select
              className="bg-transparent border-0 text-xxs text-gray-900 focus:outline-none focus:ring-0 cursor-pointer px-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Recent</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div className="flex rounded-md overflow-hidden shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)]">
            <button
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-gray-100 text-gray-900"
                  : "bg-white text-gray-500"
              }`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-gray-100 text-gray-900"
                  : "bg-white text-gray-500"
              }`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Link
            to="/dashboard/blogs/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700 transition-colors gap-2 whitespace-nowrap"
          >
            <PlusCircle className="h-3 w-3" />
            Create New Blog
          </Link>
        </div>
      </div>

      {/* Blog list */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-pulse space-y-8 w-full">
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
          <Search className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No blogs found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm
              ? "No blogs match your search criteria"
              : "Create your first blog post to get started"}
          </p>
          {!searchTerm && (
            <Button
              as={Link}
              to="/dashboard/blogs/create"
              variant="primary"
              leftIcon={<PlusCircle className="h-5 w-5" />}
            >
              Create Blog
            </Button>
          )}
        </div>
      ) : (
        <AnimatePresence>
          {viewMode === "grid" ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredBlogs.map((blog) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Card className="flex flex-col h-full">
                    <div className="relative w-full">
                      <img
                        src={
                          blog.imageUrl || "https://via.placeholder.com/400x200"
                        }
                        alt={blog.title}
                        className="w-full h-32 object-cover rounded-t-md rounded-bl-[8px] rounded-br-[8px]"
                      />
                    </div>
                    <div className="flex flex-col flex-grow p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">
                            {new Date(blog.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}{" "}
                            ·{" "}
                            {new Date(blog.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                              }
                            )}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full ${
                            blog.status === "published"
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {blog.status.charAt(0).toUpperCase() +
                            blog.status.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 flex-grow">
                        {blog.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/dashboard/blogs/${blog.id}`}
                          className="inline-flex px-4 py-2 bg-primary-50 pt-1 pb-1 text-primary-600 text-xxs  rounded-md hover:text-white hover:bg-primary-700 transition-colors w-fit"
                        >
                          View Details
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/blogs/${blog.id}`)
                            }
                            className="p-2 text-primary-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => toggleDropdown(e, blog.id)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeDropdown === blog.id && (
                            <div className="absolute right-0 bottom-full mb-1 z-50 w-36 rounded-md bg-white  dark:bg-gray-800 py-1  ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <button
                                className="flex items-center w-full px-4 py-1 text-xxs text-primary-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    window.location.origin +
                                      `/dashboard/blogs/${blog.id}`
                                  );
                                  addToast({
                                    title: "Link copied",
                                    description:
                                      "Blog link copied to clipboard",
                                    type: "success",
                                  });
                                  setActiveDropdown(null);
                                }}
                              >
                                <Copy className="h-3 w-3 mr-2" />
                                Copy Link
                              </button>
                              <button
                                className="flex items-center w-full px-4 py-1 text-xxs text-primary-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                  // In a real app, this would download the blog as PDF
                                  addToast({
                                    title: "Download started",
                                    description:
                                      "Your blog post is being downloaded",
                                    type: "success",
                                  });
                                  setActiveDropdown(null);
                                }}
                              >
                                <Download className="h-3 w-3 mr-2" />
                                Download PDF
                              </button>
                              <button
                                className="flex items-center w-full px-4 py-1 text-xxs text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                  handleDeleteBlog(blog.id);
                                  setActiveDropdown(null);
                                }}
                              >
                                <Trash className="h-3 w-3 mr-2" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredBlogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="hover:shadow-md transition-shadow"
                  hoverable
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                        <img
                          src={
                            blog.imageUrl ||
                            "https://images.pexels.com/photos/2927323/pexels-photo-2927323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                          }
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${
                              blog.status === "published"
                                ? "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300"
                                : "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300"
                            }`}
                          >
                            {blog.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                          <div className="relative">
                            <button
                              onClick={(e) => toggleDropdown(e, blog.id)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>

                            {activeDropdown === blog.id && (
                              <div className="absolute right-0 bottom-full mb-1 z-50 w-48 rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <Link
                                  to={`/dashboard/blogs/${blog.id}`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                                <Link
                                  to={`/dashboard/blogs/${blog.id}/edit`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <FileEdit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      window.location.origin +
                                        `/dashboard/blogs/${blog.id}`
                                    );
                                    addToast({
                                      title: "Link copied",
                                      description:
                                        "Blog link copied to clipboard",
                                      type: "success",
                                    });
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </button>
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => {
                                    // In a real app, this would download the blog as PDF
                                    addToast({
                                      title: "Download started",
                                      description:
                                        "Your blog post is being downloaded",
                                      type: "success",
                                    });
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </button>
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => {
                                    handleDeleteBlog(blog.id);
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                          {blog.content}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            {blog.category || "Uncategorized"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
