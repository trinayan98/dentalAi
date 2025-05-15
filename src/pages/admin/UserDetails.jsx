import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { ChevronRight, User, Mail, Calendar, BookOpen } from "lucide-react";
import { useToastStore } from "../../stores/toastStore";
import useAuthStore from "../../stores/authStore";
import { motion } from "framer-motion";
import { format, isValid } from "date-fns";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { userApi } from "../../utils/api";
import { useQuery } from "@tanstack/react-query";

// Helper function to safely format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid date";
};

export default function UserDetails() {
  const { id: userId } = useParams();
  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["userDetails", userId],
    queryFn: async () => {
      const response = await userApi.getUserDetails(token, userId);
      // Adjust this according to your API response structure
      return response;
    },
    onError: (error) => {
      addToast({
        title: "Error",
        description: error.message || "Failed to load user details",
        type: "error",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Error loading user details
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <Link to="/dashboard/users" className="text-gray-500">
          Users
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <span className="text-gray-500">User Details</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-md pb-0">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {data.user.avatar ? (
                    <img
                      src={data.user.avatar}
                      alt={data.user.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {data.user.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {data.user.username}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-0 p-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </p>
                  <p className="text-xxs font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {data.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Role
                  </p>
                  <p className="text-xxs font-medium">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-medium text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {data.user.role}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Member Since
                  </p>
                  <p className="text-xxs font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(data.user.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Last Updated
                  </p>
                  <p className="text-xxs font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(data.user.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transcriptions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="text-md p-0">
              <CardTitle>Recent Transcriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentTranscriptions?.map((transcription) => (
                  <div
                    key={transcription._id}
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                  >
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {transcription.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Status:{" "}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-medium ${
                          transcription.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transcription.status}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Created: {formatDate(transcription.createdAt)}
                    </p>
                  </div>
                ))}
                {(!data.recentTranscriptions ||
                  data.recentTranscriptions.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    No recent transcriptions found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
