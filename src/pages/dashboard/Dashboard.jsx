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
  Users,
  Shield,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import useAuthStore from "../../stores/authStore";
import { useBlogStore } from "../../stores/blogStore";
import { motion } from "framer-motion";

const userStatCards = [
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

const adminStatCards = [
  {
    title: "Total Users",
    icon: Users,
    value: "0",
    color: "bg-primary-500",
    getDataValue: () => "...", // This would need to be connected to actual user stats
  },
  {
    title: "Active Users",
    icon: Shield,
    value: "0",
    color: "bg-success-500",
    getDataValue: () => "...", // This would need to be connected to actual user stats
  },
  {
    title: "Total Blogs",
    icon: FileText,
    value: "0",
    color: "bg-warning-500",
    getDataValue: (blogs) => blogs.length.toString(),
  },
  {
    title: "System Health",
    icon: BarChart,
    value: "100%",
    color: "bg-secondary-500",
    getDataValue: () => "100%", // This would need to be connected to actual system health monitoring
  },
];

// Add admin activity data
const adminRecentActivity = [
  {
    title: "New user registration",
    date: "Just now",
    icon: Users,
    iconBg: "bg-primary-500",
  },
  {
    title: "System backup completed",
    date: "2 hours ago",
    icon: Shield,
    iconBg: "bg-success-500",
  },
  {
    title: "Security update installed",
    date: "5 hours ago",
    icon: Settings,
    iconBg: "bg-warning-500",
  },
];

// User activity data
const userRecentActivity = [
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
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { blogs, fetchBlogs, isLoading } = useBlogStore();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      fetchBlogs();
    }
  }, [fetchBlogs, isAdmin]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const statCards = isAdmin ? adminStatCards : userStatCards;
  const recentActivity = isAdmin ? adminRecentActivity : userRecentActivity;

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
              Good {getTimeOfDay()},{" "}
              {(user?.name && user.name.trim()) || user?.username || "Guest"}!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isAdmin
                ? "Here's an overview of your system and users."
                : "Here's what's happening with your blog posts today."}
            </p>
          </div>
          {!isAdmin && (
            <Link
              to="/dashboard/blogs/create"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-xxs font-medium rounded-md hover:bg-primary-700 transition-colors gap-2"
            >
              <PlusCircle className="h-3 w-3" />
              Create New Blog
            </Link>
          )}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
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
                    <p className="text-xxs text-gray-900 dark:text-white">
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

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Quick Links
          </h2>
          <Card>
            <CardContent className="space-y-2">
              {isAdmin ? (
                <>
                  <Link
                    to="/dashboard/users"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-primary-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Manage Users
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="h-4 w-4 text-primary-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        System Settings
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard/blogs/create"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group"
                  >
                    <div className="flex items-center space-x-3">
                      <PlusCircle className="h-4 w-4 text-primary-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Create New Blog
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                  <Link
                    to="/dashboard/blogs"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-primary-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        View All Blogs
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                  </Link>
                </>
              )}
              <Link
                to="/dashboard/profile"
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Profile Settings
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
