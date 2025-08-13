import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/authStore";
import { API_BASE_URL } from "../../config/constants";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash,
  FileText,
  UserCheck,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { motion } from "framer-motion";

const AllPatients = () => {
  // Stats cards configuration
  const getStatsCards = (patients, pagination) => [
    {
      id: 1,
      title: "Total Patients",
      value: pagination.totalPatients,
      icon: Users,
      iconBg: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: 2,
      title: "Active Patients",
      value: patients.filter((p) => p.status === "active").length,
      icon: UserCheck,
      iconBg: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      id: 3,
      title: "This Month",
      value: patients.filter((p) => {
        const createdAt = new Date(p.createdAt);
        const now = new Date();
        return (
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        );
      }).length,
      icon: Calendar,
      iconBg: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      id: 4,
      title: "Total Transcriptions",
      value: patients.reduce((sum, p) => sum + (p.transcriptionCount || 0), 0),
      icon: FileText,
      iconBg: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    totalPatients: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch patients from API
  const fetchPatients = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10", // You can make this configurable
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (departmentFilter) {
        params.append("department", departmentFilter);
      }
      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const response = await axios.get(
        `${API_BASE_URL}/patients?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPatients(response.data.data.patients);
        setPagination(response.data.data.pagination);
      } else {
        setError("Failed to fetch patients");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError(
        error?.response?.data?.message ||
          "Failed to fetch patients. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle search and filters
  const handleSearch = () => {
    fetchPatients(1);
  };

  const handleFilterChange = () => {
    fetchPatients(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchPatients(page);
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[100%]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="text-lg text-gray-600">Loading patients...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span className="font-medium">Patients</span>
        <ChevronRight className="h-4 w-4" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-md font-medium text-gray-900 dark:text-white">
            Manage and view all patient records
          </h1>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {getStatsCards(patients, pagination).map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="h-full"
          >
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${card.iconBg}`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg dark:border-gray-700 p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 h-10"
            />
          </div>
          <Select
            placeholder="All Departments"
            value={departmentFilter}
            onValueChange={(value) => {
              setDepartmentFilter(value);
              handleFilterChange();
            }}
            className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 h-10"
          >
            <option value="">All Departments</option>
            <option value="cardiology">Cardiology</option>
            <option value="neurology">Neurology</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="pediatrics">Pediatrics</option>
            <option value="general">General Medicine</option>
            <option value="emergency">Emergency</option>
          </Select>
          <Select
            placeholder="All Status"
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              handleFilterChange();
            }}
            className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 h-10"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </Select>
          <Button
            onClick={handleSearch}
            size="md"
            className="bg-green-600 hover:bg-green-700 text-white dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 h-10 "
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        {/* Patients Table */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden mt-7">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className=" dark:bg-gray-700/50 border-0 border-b-2">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Transcriptions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-center px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-xxs text-gray-500 dark:text-gray-400">
                            ID: {patient.patientId}
                          </div>
                          <div className="text-xxs text-gray-500 dark:text-gray-400">
                            Age:{" "}
                            {patient.age || calculateAge(patient.dateOfBirth)} •{" "}
                            {patient.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-s text-gray-900 dark:text-white">
                        {patient.email}
                      </div>
                      <div className="text-xxs text-gray-500 dark:text-gray-400">
                        {patient.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {patient.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : patient.status === "inactive"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {patient.transcriptionCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-s text-gray-500 dark:text-gray-400">
                      {formatDate(patient.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium =">
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/patients/${patient.patientId}`)
                          }
                          className="text-blue-600 bg-gray-100 rounded-full p-2 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="View patient"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 rounded-full p-2 bg-gray-100 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          title="Edit patient"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 rounded-full p-2 bg-gray-100 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete patient"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {!loading && patients.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              No patients found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Get started by adding a new patient.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing page {pagination.current} of {pagination.total}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={!pagination.hasPrev}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={!pagination.hasNext}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPatients;
