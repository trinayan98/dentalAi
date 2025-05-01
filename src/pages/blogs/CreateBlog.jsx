import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Sparkles,
  FileText,
  Edit2,
  Eye,
  Check,
  Save,
  Clock,
  Upload,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { useBlogStore } from "../../stores/blogStore";
import { useToastStore } from "../../stores/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "../../api/blogs";
import RichTextEditor from "../../components/ui/RichTextEditor";

const Step = {
  Topic: 0,
  Options: 1,
  Generating: 2,
  Review: 3,
};

export default function CreateBlog() {
  const navigate = useNavigate();
  const { generateBlog, isLoading } = useBlogStore();
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(Step.Topic);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState({
    tone: "professional",
    length: "medium",
    targetAudience: "",
    includeImages: true,
  });
  const [generationProgress, setGenerationProgress] = useState(0);

  // For step 3 (review)
  const [previewMode, setPreviewMode] = useState("edit");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [imageUploadType, setImageUploadType] = useState("file");
  const [imageUrl, setImageUrl] = useState(""); // Changed from imageUrls array to single imageUrl

  // Create blog mutation
  const createBlogMutation = useMutation({
    mutationFn: blogApi.createBlog,
    onSuccess: (data) => {
      // Invalidate and refetch blogs list
      queryClient.invalidateQueries(["blogs"]);

      addToast({
        title: "Blog saved",
        description: "Your blog has been saved successfully",
        type: "success",
      });
      navigate("/dashboard/blogs");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to save blog";

      if (error.response?.status === 401) {
        addToast({
          title: "Authentication Error",
          description: "Please login to create a blog",
          type: "error",
        });
        navigate("/login");
        return;
      }

      addToast({
        title: "Error saving blog",
        description: errorMessage,
        type: "error",
      });
    },
  });

  const handleNextStep = () => {
    if (step === Step.Topic && !topic.trim()) {
      addToast({
        title: "Topic required",
        description: "Please enter a topic for your blog",
        type: "error",
      });
      return;
    }

    if (step === Step.Options) {
      startGeneration();
    } else {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 0) {
      setStep((prevStep) => prevStep - 1);
    }
  };

  const startGeneration = async () => {
    setStep(Step.Generating);
    setGenerationProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 10);
      });
    }, 500);

    try {
      await generateBlog(topic, options);
      setGenerationProgress(100);
      clearInterval(interval);

      // Move to review step after generation
      setTimeout(() => {
        setStep(Step.Review);
      }, 1000);
    } catch (error) {
      clearInterval(interval);
      addToast({
        title: "Generation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate blog content",
        type: "error",
      });
      setStep(Step.Options);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    // Only take the first file
    if (files.length > 0) {
      setSelectedFiles([files[0]]);
      setPreviewUrls([URL.createObjectURL(files[0])]);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0]; // Only take the first file
      if (!file.type.startsWith("image/")) {
        addToast({
          title: "Invalid file type",
          description: "Please upload only image files",
          type: "error",
        });
        return;
      }
      setSelectedFiles([file]);
      setPreviewUrls([URL.createObjectURL(file)]);
    }
  };

  // Clean up preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleSaveBlog = async () => {
    try {
      // Validate title
      if (!topic) {
        throw new Error("Please enter a blog title");
      }
      if (topic.trim().length < 3) {
        throw new Error("Blog title must be at least 3 characters long");
      }
      if (topic.length > 100) {
        throw new Error("Blog title cannot exceed 100 characters");
      }

      // Validate content
      if (!content) {
        throw new Error("Please add content to your blog");
      }
      if (content.trim().length < 100) {
        throw new Error(
          "Blog content must be at least 100 characters long for a meaningful post"
        );
      }

      // Validate options
      if (
        !options.tone ||
        !["professional", "casual", "formal", "friendly"].includes(options.tone)
      ) {
        throw new Error("Please select a valid tone for your blog");
      }
      if (
        !options.length ||
        !["short", "medium", "long"].includes(options.length)
      ) {
        throw new Error("Please select a valid length for your blog");
      }

      // Create the blog data object
      const blogData = {
        title: topic.trim(),
        content: content.trim(),
        options: {
          tone: options.tone,
          length: options.length,
          targetAudience: options.targetAudience?.trim() || "",
          includeImages: options.includeImages,
        },
        status: "draft",
      };

      if (imageUploadType === "file" && selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("blogData", JSON.stringify(blogData));

        // Validate and append media file
        const file = selectedFiles[0];
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

        if (!file.type.startsWith("image/")) {
          throw new Error("Please upload only image files");
        }
        if (file.size > MAX_FILE_SIZE) {
          throw new Error("File exceeds 5MB. Please upload a smaller file.");
        }
        formData.append("media", file);

        createBlogMutation.mutate(formData);
      } else if (imageUploadType === "url" && imageUrl) {
        // Add single image URL to the blog data
        blogData.imageUrl = imageUrl;
        createBlogMutation.mutate(blogData);
      } else {
        // No image
        createBlogMutation.mutate(blogData);
      }
    } catch (error) {
      addToast({
        title: "Validation Error",
        description: error.message || "Failed to save blog",
        type: "error",
      });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case Step.Topic:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full"
          >
            <div className="mb-6 text-center">
              <h2 className="text-md font-semibold text-gray-900 mb-1 dark:text-white">
                What would you like to write about?
              </h2>
              <p className="text-xs text-gray-500">
                Enter a topic, title, or brief description for your blog post.
              </p>
            </div>

            <div className="space-y-5 flex flex-col items-center">
              <div className="max-w-xl w-full">
                <label className="block text-xxs font-medium text-gray-700 mb-1">
                  Blog topic or title
                </label>
                <Input
                  placeholder="E.g., 'The Future of Artificial Intelligence' or 'Top 10 Travel Destinations'"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  variant="primary"
                  size="xs"
                  className="px-3 py-1.5 text-xs font-medium"
                  rightIcon={<ChevronRight className="h-3.5 w-3.5 ml-1" />}
                  onClick={handleNextStep}
                >
                  Continue
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case Step.Options:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="max-w-xxl mx-auto"
          >
            <div className="mb-4 text-center">
              <h2 className="text-md font-bold text-gray-900 dark:text-white mb-1">
                Customize your blog
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Choose options to tailor your AI-generated content.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xxs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tone
                </label>
                <div className="flex flex-wrap md:flex-nowrap gap-2">
                  {["professional", "casual", "formal", "friendly"].map(
                    (tone) => (
                      <button
                        key={tone}
                        type="button"
                        className={`
                        flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-colors min-w-[100px] border border-gray-200 dark:border-gray-700 dark:border-gray-700
                        ${
                          options.tone === tone
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }
                      `}
                        onClick={() => setOptions({ ...options, tone })}
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xxs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Length
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["short", "medium", "long"].map((length) => (
                    <button
                      key={length}
                      type="button"
                      className={`
                        px-4 py-3 border rounded-lg text-xs font-medium transition-colors border-gray-200

                        ${
                          options.length === length
                            ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                            : "border-gray-300 dark:border-gray-700 text-gray-700 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }
                      `}
                      onClick={() => setOptions({ ...options, length })}
                    >
                      {length.charAt(0).toUpperCase() + length.slice(1)}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {length === "short"
                          ? "~500 words"
                          : length === "medium"
                          ? "~1000 words"
                          : "~1500 words"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xxs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target audience (optional)
                </label>
                <Input
                  placeholder="E.g., 'Marketing professionals' or 'Tech enthusiasts'"
                  value={options.targetAudience || ""}
                  onChange={(e) =>
                    setOptions({ ...options, targetAudience: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center">
                <input
                  id="include-images"
                  type="checkbox"
                  className="h-4 w-4 text-xxs text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={options.includeImages}
                  onChange={(e) =>
                    setOptions({ ...options, includeImages: e.target.checked })
                  }
                />
                <label
                  htmlFor="include-images"
                  className="ml-2 block text-xs text-gray-700 dark:text-gray-300"
                >
                  Include suggested images
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                size="xs"
                className="px-3 py-1.5 text-xs font-medium"
                leftIcon={<ChevronLeft className="h-3.5 w-3.5 mr-0" />}
                onClick={handlePrevStep}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="xs"
                className="px-4 py-1.5 text-xs font-medium"
                rightIcon={<Sparkles className="h-3.5 w-3.5 ml-0" />}
                onClick={handleNextStep}
              >
                Generate Blog
              </Button>
            </div>
          </motion.div>
        );

      case Step.Generating:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="mb-8">
              {/* <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div> */}
              <h2 className="text-md font-bold text-gray-900 dark:text-white mb-1">
                Generating your blog
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Our AI is crafting your content. This may take a few moments.
              </p>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {generationProgress}% complete
            </p>
          </motion.div>
        );

      case Step.Review:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="min-w-full mx-auto"
          >
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-md font-bold text-gray-900 dark:text-white">
                  Review your blog
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Review and edit your AI-generated content before publishing.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="bg-transparent  p-1 flex">
                  <button
                    className={`px-3 mr-2 py-1.5 rounded text-sm font-medium text-xxs ${
                      previewMode === "edit"
                        ? "bg-primary-100 text-primary-500 dark:bg-gray-700 dark:text-gray-900 dark:text-white"
                        : "bg-gray-100 text-gray-600 dark:text-gray-300  hover:bg-primary-500 hover:text-white"
                    }`}
                    onClick={() => setPreviewMode("edit")}
                  >
                    <Edit2 className="h-3 w-3 inline mr-1" />
                    Edit
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded text-sm font-medium text-xxs ${
                      previewMode === "preview"
                        ? "bg-primary-100 text-primary-500 dark:bg-gray-700 dark:text-gray-900 dark:text-white"
                        : "bg-gray-100 text-gray-600 dark:text-gray-300  hover:bg-primary-500 hover:text-white"
                    }`}
                    onClick={() => setPreviewMode("preview")}
                  >
                    <Eye className="h-3 w-3 inline mr-1" />
                    Preview
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full">
              {previewMode === "edit" ? (
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />

                  <div>
                    <label className="block text-xxs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content
                    </label>
                    <RichTextEditor
                      value={content}
                      onChange={(value) => setContent(value)}
                      placeholder="Your blog content will appear here..."
                    />
                  </div>

                  {renderFileUploadSection()}
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <h1 className="mb-2 font-medium text-md">{topic}</h1>
                  {previewUrls.length > 0 && (
                    <div className="mb-4">
                      <img
                        src={previewUrls[0]}
                        alt="Featured"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="whitespace-pre-wrap bg-primary-100 p-4 rounded-md text-xs">
                    {/* Generated content will appear here */}
                    This is a preview of your blog post. The actual content will
                    be generated by our AI.
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between gap-2">
              <Button
                variant="outline"
                size="xs"
                className="px-3 py-1.5 text-xs font-medium"
                leftIcon={<ChevronLeft className="h-3.5 w-3.5 mr-0" />}
                onClick={handlePrevStep}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="xs"
                className="px-3 py-1.5 text-xs font-medium"
                leftIcon={<Save className="h-3.5 w-3.5 mr-1" />}
                onClick={handleSaveBlog}
              >
                Save & Publish
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { label: "Topic", icon: FileText },
      { label: "Options", icon: Edit2 },
      { label: "Generating", icon: Sparkles },
      { label: "Review", icon: Check },
    ];

    return (
      <div className="mb-6">
        <div className="flex justify-between relative">
          {/* Progress Line Container */}
          <div className="absolute top-4 left-[2rem] right-[2rem] h-[2px]">
            {/* Progress Line Background */}
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
            {/* Progress Line Overlay */}
            <div
              className="absolute left-0 h-full bg-primary-500 transition-all duration-300 ease-in-out"
              style={{
                width: `${(step / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = step === index;
            const isCompleted = step > index;

            return (
              <div
                key={s.label}
                className="flex flex-col items-center relative z-10"
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                    ${
                      isCompleted
                        ? "bg-primary-500 text-white"
                        : isActive
                        ? "bg-primary-500 text-white ring-4 ring-primary-50"
                        : "bg-white text-gray-400 border-2 border-gray-200"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-[11px] font-medium transition-colors duration-200
                    ${
                      isCompleted
                        ? "text-primary-500"
                        : isActive
                        ? "text-primary-500"
                        : "text-gray-400"
                    }
                  `}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFileUploadSection = () => (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        Featured Image
      </label>
      <div className="mb-4">
        <div className="flex space-x-4 mb-2">
          <button
            onClick={() => {
              setImageUploadType("file");
              setImageUrl("");
            }}
            className={`px-3 py-1.5 rounded text-xxs font-medium ${
              imageUploadType === "file"
                ? "bg-primary-100 text-primary-500 dark:bg-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => {
              setImageUploadType("url");
              setSelectedFiles([]);
              setPreviewUrls([]);
            }}
            className={`px-3 py-1.5 rounded text-xxs font-medium ${
              imageUploadType === "url"
                ? "bg-primary-100 text-primary-500 dark:bg-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {imageUploadType === "file" ? (
        <div
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {previewUrls.length > 0 ? (
            <div className="space-y-4 w-full">
              <div className="relative">
                <img
                  src={previewUrls[0]}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-md"
                />
                <button
                  onClick={() => {
                    setPreviewUrls([]);
                    setSelectedFiles([]);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
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
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          {imageUrl && (
            <div className="relative">
              <img
                src={imageUrl}
                alt="URL Image"
                className="w-full h-40 object-cover rounded-md"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=Invalid+Image+URL";
                }}
              />
              <button
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full bg-transparent">
      <div className="flex items-center gap-2 text-xs mb-6">
        <span className=" font-medium text-gray-500 ">Create Blog</span>
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>
      <div className="max-w-[1200px] mx-auto px-6 ">
        {/* Breadcrumbs */}

        <div className="bg-transparent rounded-0  ">
          {renderStepIndicator()}
          <div className="mx-w-3xl mx-auto">
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
