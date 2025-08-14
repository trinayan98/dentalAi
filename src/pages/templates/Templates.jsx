import {
  ChevronRight,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Text,
} from "lucide-react";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "../../config/constants";
import useAuthStore from "../../stores/authStore";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { useNavigate } from "react-router-dom";

// API function to fetch templates
const fetchTemplates = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/templates`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const Templates = () => {
  const { token } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const navigate = useNavigate();
  // React Query hook to fetch templates
  const {
    data: templatesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["templates"],
    queryFn: () => fetchTemplates(token),
    enabled: !!token,
  });

  // Filter and search templates
  const filteredTemplates = React.useMemo(() => {
    if (!templatesData?.data) return [];

    let filtered = templatesData.data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filter dropdown
    if (filterValue === "default") {
      filtered = filtered.filter((template) => template.isDefault);
    } else if (filterValue === "active") {
      filtered = filtered.filter((template) => template.active);
    }

    return filtered;
  }, [templatesData?.data, searchTerm, filterValue]);

  // Count fields in a template
  const getFieldCount = (fields) => {
    return Object.keys(fields || {}).length;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-300">
            Manage templates
          </span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading templates...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-300">
            Manage templates
          </span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading templates: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-300">
          Manage templates
        </span>
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>

      {/* Header with search and actions */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search templates"
            leftIcon={<Search className="h-4 w-4 text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* <Button
            variant="outline"
            size="md"
            rightIcon={<Filter className="h-4 w-4" />}
            onClick={() =>
              setFilterValue(
                filterValue === "all"
                  ? "default"
                  : filterValue === "default"
                  ? "active"
                  : "all"
              )
            }
          >
            Filter
          </Button> */}

          <Button
            variant="teal"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate("/dashboard/create-template")}
          >
            Add Template
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template._id} className="relative pointer p-3">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-teal-900 dark:text-white">
                      {template.name}
                    </h3>
                    {template.isDefault && (
                      <span className="px-4 py-1 text-xxs font-medium bg-blue-100 text-blue-800 rounded-md flex items-center ">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-s text-gray-600 dark:text-gray-400 mb-3">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-red-600">
                      {getFieldCount(template.fields)} fields
                    </span>
                    <span className="text-teal-600 font-medium">
                      Last updated : {formatDate(template.updatedAt)}
                    </span>
                  </div>
                </div>

                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => {
                    navigate(`/dashboard/template/${template._id}`);
                    console.log(template._id);
                  }}
                >
                  <Text className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterValue !== "all"
              ? "No templates match your search criteria"
              : "No templates found"}
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
