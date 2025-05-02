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
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{userDetails.name}</h3>
                  <p className="text-sm text-gray-500">
                    {userDetails.username}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {userDetails.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-sm font-medium">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {userDetails.role}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(userDetails.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">
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
            <CardHeader>
              <CardTitle>Blog Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Blogs</p>
                  <p className="text-2xl font-semibold">
                    {userDetails.blogStats.total}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Published</p>
                  <p className="text-2xl font-semibold">
                    {userDetails.blogStats.published}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Draft</p>
                  <p className="text-2xl font-semibold">
                    {userDetails.blogStats.draft}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Views</p>
                  <p className="text-2xl font-semibold">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userDetails.monthlyBlogCount.map((month) => (
                <div
                  key={`${month._id.year}-${month._id.month}`}
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                >
                  <p className="text-sm text-gray-500">
                    {format(
                      new Date(month._id.year, month._id.month - 1),
                      "MMM yyyy"
                    )}
                  </p>
                  <p className="text-xl font-semibold">{month.count} posts</p>
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
            <Table className="w-full">
              <Thead>
                <Tr>
                  <Th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </Th>
                  <Th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </Th>
                  <Th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </Th>
                  <Th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </Th>
                  <Th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {userDetails.blogs.map((blog) => (
                  <Tr
                    key={blog._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Td className="py-4">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium">
                          {blog.title}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          blog.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {blog.status}
                      </span>
                    </Td>
                    <Td className="text-sm">{blog.views}</Td>
                    <Td className="text-sm">
                      <div className="flex items-center gap-4">
                        <span>{blog.likes} likes</span>
                        <span>{blog.comments} comments</span>
                      </div>
                    </Td>
                    <Td className="text-sm">
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
