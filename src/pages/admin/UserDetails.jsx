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
import { format } from "date-fns";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { userApi } from "../../utils/api";

export default function UserDetails() {
  const { id: userId } = useParams();
  const { token } = useAuthStore();
  const { addToast } = useToastStore();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await userApi.getUserDetails(token, userId);
        setUserDetails(data);
      } catch (error) {
        addToast({
          title: "Error",
          description: error.message || "Failed to load user details",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, token, addToast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        User not found
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
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {userDetails.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userDetails.username}
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
                    {userDetails.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Role
                  </p>
                  <p className="text-xxs font-medium">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-medium text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {userDetails.role}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Member Since
                  </p>
                  <p className="text-xxs font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(userDetails.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Last Updated
                  </p>
                  <p className="text-xxs font-medium text-gray-900 dark:text-gray-100">
                    {format(new Date(userDetails.updatedAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Blog Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="text-md p-0">
              <CardTitle>Blog Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary-100 dark:bg-primary-900/40 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Total Blogs
                  </p>
                  <p className="text-xl font-semibold text-primary-800 dark:text-primary-300">
                    {userDetails.blogStats.total}
                  </p>
                </div>
                <div className="bg-success-100 dark:bg-success-900/40 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Published
                  </p>
                  <p className="text-xl font-semibold text-success-800 dark:text-success-300">
                    {userDetails.blogStats.published}
                  </p>
                </div>
                <div className="bg-warning-100 dark:bg-warning-900/40 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Draft
                  </p>
                  <p className="text-xl font-semibold text-warning-800 dark:text-warning-300">
                    {userDetails.blogStats.draft}
                  </p>
                </div>
                <div className="bg-secondary-100 dark:bg-secondary-900/40 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Total Views
                  </p>
                  <p className="text-xl font-semibold text-secondary-800 dark:text-secondary-300">
                    {userDetails.blogStats.totalViews}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Blog Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Blog Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
              {userDetails.monthlyBlogCount.map((month) => (
                <div
                  key={`${month._id.year}-${month._id.month}`}
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg dark:bg-white"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-600">
                    {format(
                      new Date(month._id.year, month._id.month - 1),
                      "MMM yyyy"
                    )}
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-900">
                    {month.count} posts
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Blogs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Blogs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <Thead className="divide-gray-200 dark:divide-gray-700 border-b border-primary-200 ">
                <Tr>
                  <Th className=" pt-0 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-100">
                    Title
                  </Th>
                  <Th className="pt-0 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-100">
                    Status
                  </Th>
                  <Th className="pt-0 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-100">
                    Views
                  </Th>
                  <Th className="pt-0 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-100">
                    Engagement
                  </Th>
                  <Th className="pt-0 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-100">
                    Created
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {userDetails.blogs.map((blog) => (
                  <Tr
                    key={blog._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400"
                  >
                    <Td className="py-4 ">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-xs font-medium">
                          {blog.title}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-medium ${
                          blog.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {blog.status}
                      </span>
                    </Td>
                    <Td className="text-xs">{blog.views}</Td>
                    <Td className="text-xs">
                      <div className="flex items-center gap-4">
                        <span>{blog.likes} likes</span>
                        <span>{blog.comments} comments</span>
                      </div>
                    </Td>
                    <Td className="text-xs">
                      {format(new Date(blog.createdAt), "MMM d, yyyy")}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
