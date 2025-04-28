import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit2,
  Eye,
  Save,
  Trash,
  Download,
  Calendar,
  Tag,
  CheckCircle,
  FileEdit,
  ArrowLeft,
  Upload,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { useBlogStore } from "../../stores/blogStore";
import { useToastStore } from "../../stores/toastStore";
import { motion } from "framer-motion";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBlog, fetchBlog, updateBlog, deleteBlog, isLoading } =
    useBlogStore();
  const { addToast } = useToastStore();

  const [viewMode, setViewMode] = useState("edit");
  const [editedBlog, setEditedBlog] = useState(null);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchBlog(id);
    }
  }, [fetchBlog, id]);

  useEffect(() => {
    if (currentBlog) {
      setEditedBlog({ ...currentBlog });
      const words = currentBlog.content.trim().split(/\s+/).length;
      setWordCount(words);
    }
  }, [currentBlog]);

  const handleContentChange = (e) => {
    if (editedBlog) {
      const newContent = e.target.value;
      setEditedBlog({ ...editedBlog, content: newContent });
      const words = newContent.trim().split(/\s+/).length;
      setWordCount(words);
    }
  };

  const handleInputChange = (e) => {
    if (editedBlog) {
      setEditedBlog({ ...editedBlog, [e.target.name]: e.target.value });
    }
  };

  const handleTagsChange = (e) => {
    if (editedBlog) {
      const tags = e.target.value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      setEditedBlog({ ...editedBlog, tags });
    }
  };

  const handleSave = async () => {
    if (editedBlog && id) {
      try {
        await updateBlog(id, {
          ...editedBlog,
          wordCount,
          updatedAt: new Date().toISOString(),
        });
        addToast({
          title: "Blog updated",
          description: "Your blog post has been saved successfully",
          type: "success",
        });
      } catch (error) {
        addToast({
          title: "Update failed",
          description:
            error instanceof Error
              ? error.message
              : "Could not update the blog post",
          type: "error",
        });
      }
    }
  };

  const handleDelete = async () => {
    if (
      id &&
      window.confirm("Are you sure you want to delete this blog post?")
    ) {
      try {
        await deleteBlog(id);
        addToast({
          title: "Blog deleted",
          description: "The blog post has been permanently deleted",
          type: "success",
        });
        navigate("/dashboard/blogs");
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

  const handlePublish = async () => {
    if (editedBlog && id) {
      try {
        await updateBlog(id, {
          ...editedBlog,
          status: "published",
          updatedAt: new Date().toISOString(),
        });
        addToast({
          title: "Blog published",
          description: "Your blog post has been published successfully",
          type: "success",
        });
      } catch (error) {
        addToast({
          title: "Publish failed",
          description:
            error instanceof Error
              ? error.message
              : "Could not publish the blog post",
          type: "error",
        });
      }
    }
  };

  const handleGeneratePdf = () => {
    addToast({
      title: "PDF generated",
      description: "Your blog post has been downloaded as a PDF",
      type: "success",
    });
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-4xl">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentBlog || !editedBlog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Blog not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <Button
          variant="primary"
          leftIcon={<ArrowLeft className="h-5 w-5" />}
          onClick={() => navigate("/dashboard/blogs")}
        >
          Back to Blogs
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto">
      <div className="flex items-center gap-2 text-xs">
        <span
          className="text-gray-900 cursor-pointer hover:text-primary-500"
          onClick={() => navigate("/dashboard/blogs")}
        >
          My blogs
        </span>{" "}
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <span className="text-gray-500 ">Edit blog</span>{" "}
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl mx-auto"
      >
        <div className="mb-4 mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div>
              <div className="flex items-center">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {viewMode === "edit" ? "Edit Blog" : "Blog Preview"}
                </h1>
                <span
                  className={`ml-4 text-[10px] px-2 py-1 rounded-full ${
                    editedBlog.status === "published"
                      ? "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300"
                      : "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300"
                  }`}
                >
                  {editedBlog.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
              <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  Created: {new Date(editedBlog.createdAt).toLocaleDateString()}
                </span>
                {editedBlog.createdAt !== editedBlog.updatedAt && (
                  <span className="ml-3">
                    Updated:{" "}
                    {new Date(editedBlog.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="bg-transparent  p-1 flex">
              <button
                className={`px-3 mr-2 py-1.5 rounded text-sm font-medium text-xxs ${
                  viewMode === "edit"
                    ? "bg-primary-100 text-primary-500 dark:bg-gray-700 dark:text-gray-900 dark:text-white"
                    : "bg-gray-100 text-gray-600 dark:text-gray-300  hover:bg-primary-500 hover:text-white"
                }`}
                onClick={() => setViewMode("edit")}
              >
                <Edit2 className="h-3 w-3 inline mr-1" />
                Edit
              </button>
              <button
                className={`px-3 py-1.5 rounded text-sm font-medium text-xxs ${
                  viewMode === "preview"
                    ? "bg-primary-100 text-primary-500 dark:bg-gray-700 dark:text-gray-900 dark:text-white cursor-none"
                    : " bg-gray-100 text-gray-600 dark:text-gray-300  hover:bg-primary-500 hover:text-white"
                }`}
                onClick={() => setViewMode("preview")}
              >
                <Eye className="h-3 w-3 inline mr-1" />
                Preview
              </button>
            </div>

            {editedBlog.status === "draft" ? (
              <button
                variant="primary"
                size="xs"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={handlePublish}
                className="px-3 mr-2 py-1.5 rounded text-sm font-medium text-xxs bg-primary-100 text-primary-500 dark:bg-gray-700 dark:text-gray-900 dark:text-white"
              >
                Publish
              </button>
            ) : (
              <button
                variant="outline"
                size="xs"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleGeneratePdf}
                className="px-3 mr-2 py-1.5 rounded text-sm font-medium text-xxs bg-primary-100 text-primary-500 dark:bg-gray-700 dark:text-gray-900 dark:text-white hover:bg-primary-500 hover:text-white"
              >
                Download PDF
              </button>
            )}
          </div>
        </div>

        {viewMode === "edit" ? (
          <div className="space-y-6 p-0">
            <div className="p-0">
              <CardContent className="p-0 ">
                <div className="space-y-4 ">
                  <Input
                    label="Title"
                    name="title"
                    value={editedBlog.title}
                    onChange={handleInputChange}
                    placeholder="Enter blog title"
                  />

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content
                    </label>
                    <textarea
                      className="text-xs w-full h-80 p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                      value={editedBlog.content}
                      onChange={handleContentChange}
                      placeholder="Write your blog content here..."
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {wordCount} words
                    </p>
                  </div>

                  <Input
                    label="Tags (comma-separated)"
                    name="tags"
                    value={editedBlog.tags?.join(", ") || ""}
                    onChange={handleTagsChange}
                    placeholder="e.g. technology, web development, react"
                  />

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Featured Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="xs"
                leftIcon={<Trash className="h-4 w-4" />}
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                variant="primary"
                size="xs"
                leftIcon={<Save className="h-4 w-4" />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <h1 className="font-semibold">{editedBlog.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
                  <div className="flex items-center text-xxs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(editedBlog.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-xxs">
                    <Tag className="h-4 w-4 mr-1 text-xxs" />
                    {editedBlog.tags?.join(", ") || "No tags"}
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-xs">
                  {editedBlog.content}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>{" "}
    </div>
  );
}
