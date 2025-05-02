import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { fetchAdminLogs } from "../../api/admin";
import { useToastStore } from "../../stores/toastStore";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

const LOG_TYPES = [
  { value: "all", label: "All Logs" },
  { value: "access", label: "Access Logs" },
  { value: "error", label: "Error Logs" },
  { value: "system", label: "System Logs" },
];

const AdminLogs = () => {
  const { addToast } = useToastStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    type: "all",
    startDate: null,
    endDate: null,
    page: 0,
    limit: 100,
    search: "",
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const formattedStartDate = filters.startDate
        ? format(filters.startDate, "yyyy-MM-dd")
        : undefined;
      const formattedEndDate = filters.endDate
        ? format(filters.endDate, "yyyy-MM-dd")
        : undefined;

      const response = await fetchAdminLogs({
        ...filters,
        page: filters.page + 1, // API uses 1-based pagination
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      setLogs(response.data.logs);
      setTotalLogs(response.data.pagination.total);
    } catch (error) {
      console.error("Error fetching logs:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to fetch logs",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 0, // Reset page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleLimitChange = (newLimit) => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(newLimit, 10),
      page: 0,
    }));
  };

  const getLogLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      case "debug":
        return "text-gray-500";
      default:
        return "text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs">
        <Link to="/dashboard" className="text-gray-500">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <span className="text-gray-500">System Logs</span>
      </div>

      <div className="space-y-4">
        <h1 className="text-md font-bold text-gray-900 dark:text-white">
          System Logs
        </h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange("type", value)}
                placeholder="Select log type"
              >
                {LOG_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => handleFilterChange("startDate", date)}
                selectsStart
                startDate={filters.startDate}
                endDate={filters.endDate}
                maxDate={filters.endDate}
                placeholderText="Start Date"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 text-sm dark:bg-gray-800 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500"
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => handleFilterChange("endDate", date)}
                selectsEnd
                startDate={filters.startDate}
                endDate={filters.endDate}
                minDate={filters.startDate}
                placeholderText="End Date"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 text-sm dark:bg-gray-800 dark:text-gray-300 focus:border-primary-500 focus:ring-primary-500"
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div>
              <Input
                type="text"
                placeholder="Search logs..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <Thead className="divide-gray-200 dark:divide-gray-700 border-b border-primary-200 ">
                <Tr>
                  <Th className="px-4 py-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </Th>
                  <Th className="px-4 py-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </Th>
                  <Th className="px-4 py-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Level
                  </Th>
                  <Th className="px-4 py-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Message
                  </Th>
                  <Th className="px-4 py-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Source
                  </Th>
                </Tr>
              </Thead>
              <Tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <Tr>
                    <Td
                      colSpan={5}
                      className="px-4 py-4 text-center text-xxs text-gray-500 dark:text-gray-400"
                    >
                      Loading...
                    </Td>
                  </Tr>
                ) : logs.length === 0 ? (
                  <Tr>
                    <Td
                      colSpan={5}
                      className="px-4 py-4 text-center text-xxs text-gray-500 dark:text-gray-400"
                    >
                      No logs found
                    </Td>
                  </Tr>
                ) : (
                  logs.map((log) => (
                    <Tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Td className="px-4 py-4 text-xxs text-gray-900 dark:text-gray-300">
                        {new Date(log.timestamp).toLocaleString()}
                      </Td>
                      <Td className="px-4 py-4 text-xxs text-gray-900 dark:text-gray-300">
                        {log.type}
                      </Td>
                      <Td
                        className={`px-4 py-4 text-xxs ${getLogLevelColor(
                          log.level
                        )}`}
                      >
                        {log.level}
                      </Td>
                      <Td className="px-4 py-4 text-xxs text-gray-900 dark:text-gray-300">
                        {log.message}
                      </Td>
                      <Td className="px-4 py-4 text-xxs text-gray-900 dark:text-gray-300">
                        {log.source}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center space-x-2">
              <select
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 text-sm dark:bg-gray-800 dark:text-gray-300"
                value={filters.limit}
                onChange={(e) => handleLimitChange(e.target.value)}
              >
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
                <option value="250">250 per page</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 0}
                className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {filters.page + 1} of{" "}
                {Math.ceil(totalLogs / filters.limit)}
              </span>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={
                  filters.page >= Math.ceil(totalLogs / filters.limit) - 1
                }
                className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
