import {
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
  Edit,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../../config/constants";
import useAuthStore from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";

const NewTemplate = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Fields state
  const [fields, setFields] = useState([]);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Generate unique field key
  const generateFieldKey = () => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add new field
  const handleAddField = () => {
    const newField = {
      key: generateFieldKey(),
      title: "",
      instruction: "",
      required: false,
    };
    setFields([...fields, newField]);
    setEditingFieldId(newField.key);
    setEditFormData({
      title: "",
      instruction: "",
      required: false,
    });
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
  const handleSaveField = (fieldKey) => {
    const updatedFields = fields.map((field) =>
      field.key === fieldKey
        ? {
            ...field,
            title: editFormData.title,
            instruction: editFormData.instruction,
            required: editFormData.required,
          }
        : field
    );
    setFields(updatedFields);
    setEditingFieldId(null);
    setEditFormData({});
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingFieldId(null);
    setEditFormData({});
  };

  // Handle delete field
  const handleDeleteField = (fieldKey) => {
    setFields(fields.filter((field) => field.key !== fieldKey));
    if (editingFieldId === fieldKey) {
      setEditingFieldId(null);
      setEditFormData({});
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Template name is required");
      return;
    }

    if (fields.length === 0) {
      alert("At least one field is required");
      return;
    }

    // Convert fields array to object format for API
    const fieldsObject = {};
    fields.forEach((field) => {
      fieldsObject[field.key] = {
        title: field.title,
        instruction: field.instruction,
        required: field.required,
      };
    });

    const payload = {
      name: formData.name,
      description: formData.description,
      fields: fieldsObject,
    };

    setShowConfirmation(true);
  };

  // Handle confirmed submission
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Convert fields array to object format for API
      const fieldsObject = {};
      fields.forEach((field) => {
        fieldsObject[field.key] = {
          title: field.title,
          instruction: field.instruction,
          required: field.required,
        };
      });

      const payload = {
        name: formData.name,
        description: formData.description,
        fields: fieldsObject,
      };

      const response = await axios.post(`${API_BASE_URL}/templates`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Template created:", response.data);
      navigate("/dashboard/templates");
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Error creating template. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

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
          <span className="text-gray-500 dark:text-gray-300">New Template</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Template"}
        </Button>
      </div>

      {/* Template Information */}
      <Card>
        <CardHeader>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Template Information
          </h1>
          <div className="space-y-4">
            <Input
              label="Template Name"
              placeholder="Enter template name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Textarea
              label="Template Description"
              placeholder="Enter template description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
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
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleAddField}
          >
            Add Field
          </Button>
        </div>

        {fields.length > 0 ? (
          <div className="grid gap-4">
            {fields.map((field, index) => (
              <AnimatePresence key={field.key}>
                {editingFieldId === field.key ? (
                  // Edit Mode
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="bg-gray-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-md">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          </div>

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
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Field Key:{" "}
                              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                {field.key}
                              </code>
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
                                variant="primary"
                                size="sm"
                                leftIcon={<Save className="h-4 w-4" />}
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
                    <Card className="hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                                {field.title || "Untitled Field"}
                              </h3>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {field.instruction || "No instruction provided"}
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
                              leftIcon={<Edit className="h-4 w-4" />}
                              onClick={() => handleEditField(field)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Trash2 className="h-4 w-4" />}
                              onClick={() => handleDeleteField(field.key)}
                            >
                              Delete
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
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No fields added yet
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={handleAddField}
              >
                Add First Field
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Template Creation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to create this template with {fields.length}{" "}
              field{fields.length !== 1 ? "s" : ""}?
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmedSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NewTemplate;
