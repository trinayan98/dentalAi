import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Clock,
  BarChart,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Edit3,
  Settings,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/authStore";
import { useBlogStore } from "../../stores/blogStore";
import { motion } from "framer-motion";

const statCards = [
  {
    title: "Total Blogs",
    icon: FileText,
    value: "0",
    color: "bg-primary-500",
    getDataValue: (blogs) => blogs.length.toString(),
  },
  {
    title: "Published",
    icon: PlusCircle,
    value: "0",
    color: "bg-success-500",
    getDataValue: (blogs) =>
      blogs.filter((blog) => blog.status === "published").length.toString(),
  },
  {
    title: "Drafts",
    icon: Bookmark,
    value: "0",
    color: "bg-warning-500",
    getDataValue: (blogs) =>
      blogs.filter((blog) => blog.status === "draft").length.toString(),
  },
  {
    title: "Total Words",
    icon: BarChart,
    value: "0",
    color: "bg-secondary-500",
    getDataValue: (blogs) =>
      blogs
        .reduce((total, blog) => total + (blog.wordCount || 0), 0)
        .toLocaleString(),
  },
];

// Add recent activity data
const recentActivity = [
  {
    title: 'Published "How to Optimize Your Content for Search Engines"',
    date: "Mar 15, 2025",
    icon: CheckCircle2,
    iconBg: "bg-green-500",
  },
  {
    title: 'Created "The Future of AI in Content Creation"',
    date: "Mar 10, 2025",
    icon: PlusCircle,
    iconBg: "bg-primary-500",
  },
  {
    title: 'Updated "10 Effective Email Marketing Strategies for 2025"',
    date: "Mar 8, 2025",
    icon: Edit3,
    iconBg: "bg-yellow-500",
  },
  {
    title: "Updated WordPress integration settings",
    date: "Mar 6, 2025",
    icon: Settings,
    iconBg: "bg-gray-500",
  },
  {
    title: 'Published "10 Effective Email Marketing Strategies for 2025"',
    date: "Mar 5, 2025",
    icon: CheckCircle2,
    iconBg: "bg-green-500",
  },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { blogs, fetchBlogs, isLoading } = useBlogStore();

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const recentBlogs = blogs.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <Link to="/dashboard" className="text-gray-500 ">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>

      {/* Greeting */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Good afternoon, {user?.name || "John"}!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your blog posts today.
            </p>
          </div>
          <Link
            to="/dashboard/blogs/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700 transition-colors gap-2"
          >
            <PlusCircle className="h-3 w-3" />
            Create New Blog
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="flex items-center space-x-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {isLoading ? "..." : stat.getDataValue(blogs)}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Blogs and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Blogs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Recent Blogs
            </h2>
            <Link
              to="/dashboard/blogs"
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center"
            >
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
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
                      {blog.excerpt}
                    </p>
                    <Link
                      to={`/dashboard/blogs/${blog.id}`}
                      className="inline-flex px-4 py-2 bg-primary-50 pt-1 pb-1 text-primary-600 text-xxs rounded-md hover:text-white hover:bg-primary-700 transition-colors w-fit"
                    >
                      View Details
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <Card>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                    <activity.icon className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <span className="text-[10px] text-gray-500">
                      {activity.date}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
