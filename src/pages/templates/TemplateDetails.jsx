import {
  ChevronRight,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  Save,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../../config/constants";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";

// API function to fetch template details
const fetchTemplateDetails = async (token, templateId) => {
  const response = await axios.get(`${API_BASE_URL}/templates/${templateId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// API function to update template
const updateTemplateAPI = async (token, templateId, templateData) => {
  const response = await axios.put(
    `${API_BASE_URL}/templates/${templateId}`,
    templateData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// API function to delete template
const deleteTemplateAPI = async (token, templateId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/templates/${templateId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const TemplateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { addToast } = useToastStore();
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateEditData, setTemplateEditData] = useState({});

  // React Query hook to fetch template details
  const {
    data: templateData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["template", id],
    queryFn: () => fetchTemplateDetails(token, id),
    enabled: !!token && !!id,
  });

  const template = templateData?.data;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle edit template
  const handleEditTemplate = () => {
    setIsEditingTemplate(true);
    setTemplateEditData({
      name: template.name,
      description: template.description,
    });
  };

  // Handle save template
  const handleSaveTemplate = async () => {
    try {
      // Prepare the fields data in the required format
      const fieldsData = {};
      template.fields?.forEach((field) => {
        fieldsData[field.key] = {
          title: field.title,
          instruction: field.instruction,
          required: field.required,
        };
      });

      const updateData = {
        name: templateEditData.name,
        description: templateEditData.description,
        fields: fieldsData,
      };

      await updateTemplateAPI(token, id, updateData);
      setIsEditingTemplate(false);
      setTemplateEditData({});
      refetch(); // Refresh the data

      addToast({
        type: "success",
        title: "Template Updated",
        description: "Template information has been successfully updated.",
      });
    } catch (error) {
      console.error("Error saving template:", error);
      addToast({
        type: "error",
        title: "Update Failed",
        description:
          error.response?.data?.message ||
          "Failed to update template. Please try again.",
      });
    }
  };

  // Handle cancel template edit
  const handleCancelTemplateEdit = () => {
    setIsEditingTemplate(false);
    setTemplateEditData({});
  };

  // Handle edit field
  const handleEditField = (field) => {
    setEditingFieldId(field.key);
    setEditFormData({
      title: field.title,
      instruction: field.instruction,
      required: field.required,
    });
  };

  // Handle save field
  const handleSaveField = async (fieldKey) => {
    try {
      // Prepare the fields data in the required format with updated field
      const fieldsData = {};
      template.fields?.forEach((field) => {
        if (field.key === fieldKey) {
          // Update the specific field with new data
          fieldsData[field.key] = {
            title: editFormData.title,
            instruction: editFormData.instruction,
            required: editFormData.required,
          };
        } else {
          // Keep other fields unchanged
          fieldsData[field.key] = {
            title: field.title,
            instruction: field.instruction,
            required: field.required,
          };
        }
      });

      const updateData = {
        name: template.name,
        description: template.description,
        fields: fieldsData,
      };

      await updateTemplateAPI(token, id, updateData);
      setEditingFieldId(null);
      setEditFormData({});
      refetch(); // Refresh the data

      addToast({
        type: "success",
        title: "Field Updated",
        description: "Field has been successfully updated.",
      });
    } catch (error) {
      console.error("Error saving field:", error);
      addToast({
        type: "error",
        title: "Update Failed",
        description:
          error.response?.data?.message ||
          "Failed to update field. Please try again.",
      });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingFieldId(null);
    setEditFormData({});
  };

  // Handle delete template
  const handleDeleteTemplate = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteTemplateAPI(token, id);
        addToast({
          type: "success",
          title: "Template Deleted",
          description: "Template has been successfully deleted.",
        });
        navigate("/dashboard/templates");
      } catch (error) {
        console.error("Error deleting template:", error);
        addToast({
          type: "error",
          title: "Delete Failed",
          description:
            error.response?.data?.message ||
            "Failed to delete template. Please try again.",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-300">
            Template details
          </span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading template details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-300">
            Template details
          </span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading template: {error.message}
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-300">
            Template details
          </span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Template not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => navigate("/dashboard/templates")}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Templates</span>
          </button>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="text-gray-500 dark:text-gray-300">
            {template.name}
          </span>
        </div>
      </div>

      {/* Template Information */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditingTemplate ? (
                // Edit Mode
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <Input
                    label="Template Name"
                    value={templateEditData.name || ""}
                    onChange={(e) =>
                      setTemplateEditData({
                        ...templateEditData,
                        name: e.target.value,
                      })
                    }
                    className="bg-white dark:bg-gray-800"
                  />

                  <Textarea
                    label="Template Description"
                    value={templateEditData.description || ""}
                    onChange={(e) =>
                      setTemplateEditData({
                        ...templateEditData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="bg-white dark:bg-gray-800"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-s text-gray-500 dark:text-gray-400">
                      <div>
                        <span className="font-bold text-gray-600">
                          Created:
                        </span>{" "}
                        {formatDate(template.createdAt)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-600">
                          Updated:
                        </span>{" "}
                        {formatDate(template.updatedAt)}
                      </div>
                      <div>
                        <span className="font-bold text-gray-600">Fields:</span>{" "}
                        {template.fields?.length || 0}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<X className="h-4 w-4" />}
                        onClick={handleCancelTemplateEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Save className="h-4 w-4" />}
                        onClick={handleSaveTemplate}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // View Mode
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 py-2"
                >
                  <div className="flex items-center gap-2 mb-4 justify-between">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                        {template.name}
                      </h1>
                      {template.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Default
                        </span>
                      )}
                      {template.active ? (
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full flex items-center gap-1">
                          <Circle className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit className="h-4 w-4 text-teal-600" />}
                        onClick={handleEditTemplate}
                        disabled={isEditingTemplate}
                      >
                        Edit Template
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Trash2 className="h-4 w-4 text-red-600" />}
                        onClick={handleDeleteTemplate}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-6 text-s text-gray-500 dark:text-gray-400">
                    <div>
                      <span className="font-bold text-teal-600">Created:</span>{" "}
                      {formatDate(template.createdAt)}
                    </div>
                    <div>
                      <span className="font-bold text-teal-600">Updated:</span>{" "}
                      {formatDate(template.updatedAt)}
                    </div>
                    <div>
                      <span className="font-bold text-teal-600">Fields:</span>{" "}
                      {template.fields?.length || 0}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Fields Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-semibold text-gray-900 dark:text-white">
            Template Fields
          </h2>
          <Button
            variant="teal"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Add Field
          </Button>
        </div>

        {template.fields && template.fields.length > 0 ? (
          <div className="grid gap-4">
            {template.fields.map((field, index) => (
              <AnimatePresence key={field.key || index}>
                {editingFieldId === field.key ? (
                  // Edit Mode
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="bg-gray-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-md px-3 py-2">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <Input
                            label="Field Title"
                            value={editFormData.title || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                title: e.target.value,
                              })
                            }
                            className="bg-white dark:bg-gray-800"
                          />

                          <Textarea
                            label="Field Instruction"
                            value={editFormData.instruction || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                instruction: e.target.value,
                              })
                            }
                            rows={3}
                            className="bg-white dark:bg-gray-800"
                          />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Required Field
                              </label>
                              <input
                                type="checkbox"
                                checked={editFormData.required || false}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    required: e.target.checked,
                                  })
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<X className="h-4 w-4" />}
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="teal"
                                size="sm"
                                leftIcon={<Save className="h-4 w-4 " />}
                                onClick={() => handleSaveField(field.key)}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  // View Mode
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="hover:shadow-md transition-shadow duration-200 px-3 py-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-md font-semibold text-teal-900 dark:text-white">
                                {field.title}
                              </h3>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {field.instruction}
                            </p>

                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Required:{" "}
                              <span className="px-2 py-1 text-xxs font-medium bg-green-100 text-green-800 rounded-full">
                                {field.required ? "Yes" : "No"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary-500 bg-primary-100/60"
                              onClick={() => handleEditField(field)}
                            >
                              {" "}
                              <Edit className="h-4 w-4 text-primary-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-red-100/60 text-red-700"
                            >
                              {" "}
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                No fields defined for this template
              </div>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                leftIcon={<Edit className="h-4 w-4" />}
              >
                Add First Field
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TemplateDetails;
