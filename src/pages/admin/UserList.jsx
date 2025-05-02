import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import useUsersStore from "../../stores/usersStore";
import { Button } from "../../components/ui/Button";
import { useToastStore } from "../../stores/toastStore";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Search,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { Input } from "../../components/ui/Input";

export default function UserList() {
  const { users, isLoading, error, fetchUsers, pagination } = useUsersStore();
  const { addToast } = useToastStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when page or search term changes
  useEffect(() => {
    const loadUsers = async () => {
      try {
        await fetchUsers({
          page: currentPage,
          limit: 10,
          search: debouncedSearchTerm,
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: error.message || "Failed to load users",
          type: "error",
        });
      }
    };
    loadUsers();
  }, [fetchUsers, addToast, currentPage, debouncedSearchTerm]);

  const handlePageChange = (page) => {
    if (page < 1 || page > (pagination?.pages || 1)) return;
    setCurrentPage(page);
  };

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  // Calculate pagination range
  const getPageRange = () => {
    const totalPages = pagination?.pages || 1;
    const range = 2; // Number of pages to show on each side of current page
    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);

    // Adjust range to always show 5 pages if possible
    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(start + 4, totalPages);
      } else if (end === totalPages) {
        start = Math.max(end - 4, 1);
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs">
        <Link className="text-gray-500 ">Users</Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="h-4 w-4 text-gray-400" />}
            className="bg-gray-50 border-0"
          />
        </div>
        <Button variant="primary" size="xs">
          Add User
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <Thead className="divide-gray-200 dark:divide-gray-700 border-b border-primary-200 ">
              <Tr>
                <Th className="px-6 py-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider  ">
                  Name
                </Th>
                <Th className="px-6 py-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </Th>
                <Th className="px-6 py-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </Th>
                <Th className="px-6 py-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </Th>
                <Th className="px-6 py-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <Tr>
                  <Td colSpan="5" className="text-center py-4">
                    Loading...
                  </Td>
                </Tr>
              ) : users.length === 0 ? (
                <Tr>
                  <Td colSpan="5" className="text-center py-4">
                    {searchTerm
                      ? "No users found matching your search"
                      : "No users found"}
                  </Td>
                </Tr>
              ) : (
                users.map((user) => (
                  <Tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <Td className="px-4 py-4 text-xs text-gray-900 dark:text-gray-300">
                      {user.name}
                    </Td>
                    <Td className="px-4 py-4 text-xs text-gray-900 dark:text-gray-300">
                      {user.email}
                    </Td>
                    <Td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </Td>
                    <Td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </Td>
                    <Td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="flex space-x-2">
                        <Link to={`/dashboard/users/${user._id}`}>
                          {/* <Button variant="outline" size="sm">
                            View Details
                          </Button> */}
                        </Link>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </div>

        {/* Enhanced Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 px-2">
            <div className="text-xs text-gray-500">
              Showing {(currentPage - 1) * 10 + 1} to{" "}
              {Math.min(currentPage * 10, pagination.total)} of{" "}
              {pagination.total} users
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`p-1 rounded ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1 rounded ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex gap-1">
                {getPageRange().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded text-xs ${
                      currentPage === page
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className={`p-1 rounded ${
                  currentPage === pagination.pages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => handlePageChange(pagination.pages)}
                disabled={currentPage === pagination.pages}
                className={`p-1 rounded ${
                  currentPage === pagination.pages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
