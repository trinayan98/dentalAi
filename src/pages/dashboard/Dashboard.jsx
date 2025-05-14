import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Clock,
  BarChart,
  ArrowRight,
  Mic,
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
import { useTranscribeStore } from "../../stores/transcribeStore";
import { motion } from "framer-motion";
import axios from "axios";
import Skeleton from "../../components/ui/Skeleton";
import { API_BASE_URL } from "../../config/constants";

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
    title: 'Completed "Meeting Transcription"',
    date: "Mar 15, 2025",
    icon: CheckCircle2,
    iconBg: "bg-green-500",
  },
  {
    title: 'Created "Interview Recording"',
    date: "Mar 10, 2025",
    icon: PlusCircle,
    iconBg: "bg-primary-500",
  },
  {
    title: 'Updated "Conference Call Notes"',
    date: "Mar 8, 2025",
    icon: Edit3,
    iconBg: "bg-yellow-500",
  },
];

const Dashboard = () => {
  const { user } = useAuthStore();
  const { transcriptions, fetchTranscriptions, isLoading } =
    useTranscribeStore();
  const isAdmin = user?.role === "admin";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = useAuthStore.getState().token;
        const endpoint = isAdmin
          ? `${API_BASE_URL}/dashboard/admin-stats`
          : `${API_BASE_URL}/dashboard/user-stats`;
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    if (!isAdmin) {
      fetchTranscriptions(new URLSearchParams({ limit: 3 }));
    }
  }, [fetchTranscriptions, isAdmin]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const getBaseUrl = () => (isAdmin ? "/admin" : "/user");
  const baseUrl = getBaseUrl();

  // Define stat cards inside the component to access stats state
  const statCards = isAdmin
    ? [
        {
          title: "Total Users",
          icon: Users,
          value: stats?.totalUsers?.value || "0",
          color: stats?.totalUsers?.color || "bg-primary-500",
        },
        {
          title: "Active Users",
          icon: Shield,
          value: stats?.activeUsers?.value || "0",
          color: stats?.activeUsers?.color || "bg-success-500",
        },
        {
          title: "Total Transcriptions",
          icon: Mic,
          value: stats?.totalTranscriptions?.value || "0",
          color: stats?.totalTranscriptions?.color || "bg-warning-500",
        },
        {
          title: "System Health",
          icon: BarChart,
          value: stats?.systemHealth?.value || "100%",
          color: stats?.systemHealth?.color || "bg-secondary-500",
        },
      ]
    : [
        {
          title: stats?.totalTranscriptions?.title || "Total Transcriptions",
          icon: Mic,
          value: stats?.totalTranscriptions?.value || "0",
          color: stats?.totalTranscriptions?.color || "bg-primary-500",
        },
        {
          title: stats?.completed?.title || "Completed",
          icon: CheckCircle2,
          value: stats?.completed?.value || "0",
          color: stats?.completed?.color || "bg-success-500",
        },
        {
          title: stats?.processing?.title || "Processing",
          icon: Clock,
          value: stats?.processing?.value || "0",
          color: stats?.processing?.color || "bg-warning-500",
        },
        {
          title: stats?.totalDuration?.title || "Total Duration",
          icon: BarChart,
          value: stats?.totalDuration?.value || "0 min",
          color: stats?.totalDuration?.color || "bg-secondary-500",
        },
      ];

  const recentActivity = isAdmin ? adminRecentActivity : userRecentActivity;
  const recentTranscriptions = transcriptions.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <Link to={baseUrl} className="text-gray-900 dark:text-gray-300">
          {isAdmin ? "Admin" : "Dashboard"}
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>
      {/* Greeting */}
      <div className="">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Good {getTimeOfDay()},{" "}
              {(user?.name && user.name.trim()) || user?.username || "Guest"}!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isAdmin
                ? "Here's an overview of your system and users."
                : "Here's what's happening with your transcriptions today."}
            </p>
          </div>
          {!isAdmin && (
            <Link
              to={`${baseUrl}/transcribe/create`}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-xxs font-medium rounded-md hover:bg-primary-700 transition-colors gap-2"
            >
              <PlusCircle className="h-3 w-3" />
              New Transcription
            </Link>
          )}
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
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
                    {loading ? "..." : stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transcriptions */}
        {!isAdmin && (
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recent Transcriptions
              </h2>
              <Link
                to={`${baseUrl}/transcribe`}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center"
              >
                View all
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isLoading ? (
                // Skeleton loading cards
                <>
                  {[1, 2, 3].map((index) => (
                    <Card
                      key={`skeleton-${index}`}
                      className="flex flex-col h-full"
                    >
                      <Skeleton className="w-full h-32 rounded-t-md" />
                      <div className="flex flex-col flex-grow p-5 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-12 w-full" />
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              ) : (
                recentTranscriptions.map((transcription, index) => (
                  <motion.div
                    key={transcription._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Card className="flex flex-col h-full">
                      {/* <div className="relative w-full">
                        <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-t-md">
                          <Mic className="h-8 w-8 text-gray-400" />
                        </div>
                      </div> */}

                      <div className="flex flex-col flex-grow p-5 space-y-2">
                        <div className="flex items-center justify-between text-gray-500">
                          <div className="flex items-center gap-2">
                            <Clock className="h-2.5 w-2.5" />
                            <span className="text-2xs">
                              {new Date(
                                transcription.createdAt
                              ).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-xxs font-semibold text-gray-900 dark:text-white">
                          {transcription.title}
                        </h3>
                        <p className="text-2xs text-gray-600 dark:text-gray-400 line-clamp-2 flex-grow">
                          {transcription.transcription?.substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <Link
                            to={`${baseUrl}/transcribe/${transcription._id}`}
                            className="inline-flex px-4 py-2 bg-primary-50 pt-1 pb-1 text-primary-600 text-2xs rounded-md hover:text-white hover:bg-primary-700 transition-colors w-fit"
                          >
                            View Details
                          </Link>

                          <span
                            className={`text-[10px] px-2 py-1 rounded-full ${
                              transcription.status === "completed"
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {transcription.status.charAt(0).toUpperCase() +
                              transcription.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default Dashboard;
