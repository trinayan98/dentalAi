import { Textarea } from "../../components/ui/Textarea";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import {
  ChevronRight,
  Copy,
  Delete,
  Printer,
  RefreshCcw,
  Trash,
  ChevronDown,
  Edit,
  ChevronLeft,
  ChevronRightIcon,
  ChevronsRightLeft,
  ChevronsLeft,
  Loader2,
  Save,
  X,
  Text,
  Notebook,
  NotebookText,
  User2,
  UserCircle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Form } from "react-hook-form";
import LiveTranscript from "./LiveTranscript";
import useAuthStore from "../../stores/authStore";
import { API_BASE_URL } from "../../config/constants";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";

const NewTranscription = () => {
  const { token } = useAuthStore();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTemplateMinimized, setIsTemplateMinimized] = useState(true);

  // Summary state
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [editingSummary, setEditingSummary] = useState({});
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Load saved summary from localStorage on component mount
  useEffect(() => {
    const savedSummary = localStorage.getItem("savedSummaryData");
    if (savedSummary) {
      try {
        const parsedSummary = JSON.parse(savedSummary);
        setSummaryData(parsedSummary);
      } catch (error) {
        console.error("Error loading saved summary:", error);
      }
    }
  }, []);

  // Auto-select template based on summaryData.templateName
  useEffect(() => {
    if (
      summaryData?.templateName &&
      templates.length > 0 &&
      !selectedTemplate
    ) {
      const matchingTemplate = templates.find(
        (template) => template.name === summaryData.templateName
      );
      if (matchingTemplate) {
        setSelectedTemplate(matchingTemplate);
      }
    }
  }, [summaryData, templates, selectedTemplate]);

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/templates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();
      setTemplates(data.data || data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      // For demo purposes, add some sample templates
      setTemplates([
        {
          _id: 1,
          name: "Specific/Emergency Examination",
          description:
            "Comprehensive template for special or emergency medical examinations",
          fields: {
            medicalHistory: {
              title: "Medical History Update",
              instruction: "Update patient's medical history",
              required: false,
              order: 1,
            },
            chiefComplaint: {
              title: "Chief Complaint",
              instruction: "Primary reason for visit",
              required: true,
              order: 2,
            },
            extraOralExam: {
              title: "Extra Oral Exam",
              instruction: "External examination findings",
              required: false,
              order: 3,
            },
            intraOralExam: {
              title: "Intra Oral Exam",
              instruction: "Internal oral examination findings",
              required: true,
              order: 4,
            },
            specialInvestigations: {
              title: "Special Investigations",
              instruction: "Additional tests or procedures performed",
              required: false,
              order: 5,
            },
            radiographs: {
              title: "Radiographs",
              instruction: "X-ray or imaging findings",
              required: false,
              order: 6,
            },
            diagnosis: {
              title: "Diagnosis",
              instruction: "Primary and differential diagnoses",
              required: true,
              order: 7,
            },
            discussion: {
              title: "Discussion",
              instruction: "Clinical reasoning and analysis",
              required: false,
              order: 8,
            },
            treatmentPlan: {
              title: "Treatment Plan",
              instruction: "Proposed treatment approach",
              required: true,
              order: 9,
            },
            procedure: {
              title: "Procedure",
              instruction: "Specific procedures performed",
              required: false,
              order: 10,
            },
            nextVisit: {
              title: "Next Visit",
              instruction: "Follow-up appointment details",
              required: false,
              order: 11,
            },
          },
        },
        {
          _id: 2,
          name: "SOAP",
          description:
            "Standard SOAP (Subjective, Objective, Assessment, Plan) template for medical documentation",
          fields: {
            subjective: {
              title: "Subjective",
              instruction: "Patient's chief complaint and history",
              required: true,
              order: 1,
            },
            objective: {
              title: "Objective",
              instruction: "Physical examination findings and test results",
              required: true,
              order: 2,
            },
            assessment: {
              title: "Assessment",
              instruction: "Diagnosis and differential diagnosis",
              required: true,
              order: 3,
            },
            plan: {
              title: "Plan",
              instruction: "Treatment plan and follow-up",
              required: true,
              order: 4,
            },
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleTemplateChange = (templateId) => {
    const template = templates.find((t) => t._id == templateId);
    setSelectedTemplate(template);
  };

  // Helper function to get sorted fields from template
  const getSortedFields = (template) => {
    if (!template?.fields) return [];

    return Object.entries(template.fields)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([key, field]) => ({
        key,
        ...field,
      }));
  };

  // Helper function to format transcription from localStorage
  const formatTranscriptionForAPI = () => {
    const savedUtterances = localStorage.getItem("transcriptUtterances");
    if (!savedUtterances) return "";

    try {
      const utterances = JSON.parse(savedUtterances);
      return utterances
        .map((utterance) => {
          const totalSeconds = Math.floor(utterance.start / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          const timestamp = `[${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}]`;
          return `${timestamp} ${utterance.text}`;
        })
        .join(" ");
    } catch (error) {
      console.error("Error formatting transcription:", error);
      return "";
    }
  };

  // Helper function to save summary to localStorage
  const saveSummaryToLocalStorage = (summaryData) => {
    try {
      const summaryToSave = {
        ...summaryData,
        savedAt: new Date().toISOString(),
        templateId: selectedTemplate?._id,
        templateName: selectedTemplate?.name,
      };
      localStorage.setItem("savedSummaryData", JSON.stringify(summaryToSave));
    } catch (error) {
      console.error("Error saving summary to localStorage:", error);
    }
  };

  // Helper function to clear saved summary
  const clearSavedSummary = () => {
    localStorage.removeItem("savedSummaryData");
    setSummaryData(null);
    setShowClearConfirmation(false);
  };

  // Handle clear button click
  const handleClearClick = () => {
    setShowClearConfirmation(true);
  };

  // Generate summary function
  const generateSummary = async () => {
    if (!selectedTemplate) {
      alert("Please select a template first");
      return;
    }

    const transcription = formatTranscriptionForAPI();
    if (!transcription.trim()) {
      alert(
        "No transcription data found. Please upload and transcribe audio first."
      );
      return;
    }

    setSummaryLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5001/api/summary/generate",
        {
          transcription: transcription,
          templateId: selectedTemplate._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const summaryWithMetadata = {
          ...response.data.data,
          savedAt: new Date().toISOString(),
          templateId: selectedTemplate._id,
          templateName: selectedTemplate.name,
        };
        setSummaryData(summaryWithMetadata);
        saveSummaryToLocalStorage(summaryWithMetadata);
      } else {
        console.error("Summary generation failed:", response.data.message);
        alert("Failed to generate summary. Please try again.");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      alert(
        "Error generating summary. Please check your connection and try again."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  // Regenerate summary function
  const regenerateSummary = () => {
    generateSummary();
  };

  // Edit summary functions
  const handleEditSummary = () => {
    if (summaryData) {
      setEditingSummary(summaryData.summary);
      setIsEditingSummary(true);
    }
  };

  const handleSaveSummary = () => {
    const updatedSummaryData = {
      ...summaryData,
      summary: editingSummary,
    };
    setSummaryData(updatedSummaryData);
    saveSummaryToLocalStorage(updatedSummaryData);
    setIsEditingSummary(false);
    setEditingSummary({});
  };

  const handleCancelEditSummary = () => {
    setIsEditingSummary(false);
    setEditingSummary({});
  };

  const handleSummarySectionChange = (key, value) => {
    setEditingSummary((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        content: value,
      },
    }));
  };

  return (
    <div className="space-y-3 ">
      {" "}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-300">Create Note</span>{" "}
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>
      <div className="grid grid-cols-8 gap-6 ">
        <LiveTranscript />
        <div className="col-span-4">
          <div className=" border border-1 border-gray-200  rounded-lg bg-white">
            <div className="w-full border-0 border-b-2 border-gray-200 py-4 px-5 flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300 font-semibold flex justify-between items-center">
                <NotebookText size={18} className="mr-3" /> Summary
              </span>
              <div className="relative">
                <Select
                  value={selectedTemplate?._id || ""}
                  onValueChange={handleTemplateChange}
                  placeholder="Select a template"
                  className="bg-gray-50 border-0"
                >
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-0  h-[63vh]   bg-white p-0 overflow-y-auto">
              <div
                className={` p-5 ${
                  isTemplateMinimized ? "col-span-6" : "col-span-4"
                } `}
              >
                {summaryLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                      <span className="text-gray-600">
                        Generating summary...
                      </span>
                    </div>
                  </div>
                ) : summaryData ? (
                  <div className="space-y-4">
                    {/* Summary metadata */}

                    <div className="text-xs text-gray-500 mb-3 p-2 bg-green-400/10 rounded">
                      <div className="flex items-center justify-between">
                        <div className="px-4 py-2">
                          <h4 className="text-md font-medium flex items-center gap-2">
                            {" "}
                            <span>
                              <UserCircle />
                            </span>
                            John Doe
                          </h4>
                          <span className="text-xxs text-gray-500 flex items-center mt-2 ">
                            <span className="text-gray-900 font-semibold me-2">
                              {" "}
                              DOB :
                            </span>{" "}
                            01/15/1985
                          </span>
                        </div>
                        <span className="pr-3">
                          <span className="text-gray-900 font-semibold">
                            {" "}
                            Generated :
                          </span>{" "}
                          <span className="font-medium ">
                            {summaryData.savedAt
                              ? new Date(summaryData.savedAt).toLocaleString()
                              : "Unknown"}
                          </span>
                        </span>
                      </div>
                    </div>
                    {Object.entries(
                      isEditingSummary ? editingSummary : summaryData.summary
                    ).map(([key, section]) => (
                      <div
                        key={key}
                        className="border-b border-gray-200 pb-3 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-600 text-sm">
                            {section.title}
                            {section.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </h3>
                          {isEditingSummary && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleSummarySectionChange(
                                    key,
                                    section.content
                                  )
                                }
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Reset
                              </button>
                            </div>
                          )}
                        </div>
                        {isEditingSummary ? (
                          <Textarea
                            value={section.content}
                            onChange={(e) =>
                              handleSummarySectionChange(key, e.target.value)
                            }
                            className="w-full text-s leading-relaxed resize-none"
                            rows={Math.max(
                              3,
                              section.content.split("\n").length
                            )}
                            placeholder={`Enter ${section.title.toLowerCase()} content...`}
                          />
                        ) : (
                          <p className="text-gray-700 text-s leading-relaxed bg-gray-100/50 p-4 rounded-md">
                            {section.content}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center">
                    <p className="mb-2">No summary generated yet</p>
                    <p className="text-xs">
                      Select a template and click "Generate Summary" to create a
                      medical summary
                    </p>
                  </div>
                )}
              </div>

              {!isTemplateMinimized && (
                <div className=" p-3  col-span-2 border-l-2 border-gray-300 relative">
                  {selectedTemplate ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 ms-3">
                          <span className="text-s font-medium">
                            {selectedTemplate.name}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 ">
                        {getSortedFields(selectedTemplate).map(
                          (field, index) => (
                            <div
                              key={field.key}
                              className="flex items-center gap-1"
                            >
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                              <div className="text-xxs text-gray-600">
                                {field.title}
                              </div>
                              {field.required && (
                                <span className="text-xs text-red-500">*</span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      Select a template
                    </div>
                  )}
                </div>
              )}

              {isTemplateMinimized ? (
                <button
                  onClick={() => setIsTemplateMinimized(false)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
                  title="Expand template"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
              ) : (
                <button
                  onClick={() => setIsTemplateMinimized(true)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
                  title="Expand template"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
          <div className="w-full flex items-center justify-between mt-6">
            <div className="buttons flex items-center gap-4 ">
              <button
                onClick={generateSummary}
                disabled={summaryLoading || !selectedTemplate}
                className="flex items-center text-s gap-2 border-2 border-gray-400 text-gray-500 bg-transparent rounded-full px-6 py-2 font-medium transition hover:bg-primary-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {summaryLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCcw size={16} />
                )}
                {summaryLoading ? "Generating..." : "Generate"}
              </button>
              {/* <button
                onClick={regenerateSummary}
                disabled={summaryLoading || !summaryData || !selectedTemplate}
                className="flex items-center text-s gap-2 border-2 border-primary-100 text-primary-500 bg-transparent rounded-full px-6 py-2 font-medium transition hover:bg-primary-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <RefreshCcw size={18} />
                Regenerate
              </button> */}

              <button
                className="flex items-center justify-center border-2 border-gray-300 text-gray-400 bg-transparent rounded-full p-2 transition hover:bg-gray-100 focus:outline-none"
                type="button"
              >
                <Copy size={16} />
              </button>

              {summaryData && !summaryLoading && (
                <div className="flex items-center gap-2  w-full pe-1">
                  {isEditingSummary ? (
                    <>
                      <button
                        onClick={handleSaveSummary}
                        className="flex items-center gap-1 text-xxs text-green-600 hover:text-green-800 font-medium px-2 py-1 bg-gray-100 rounded-sm"
                      >
                        <Save size={14} />
                        Save
                      </button>
                      <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 font-medium px-2 py-1 bg-gray-100 rounded-sm">
                        <X size={14} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleEditSummary}
                        className="flex items-center justify-center border-2 border-gray-300 text-gray-400 bg-transparent rounded-full p-2 transition hover:bg-gray-100 focus:outline-none"
                        type="button"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={handleCancelEditSummary}
                        className="flex items-center justify-center border-2 border-red-300 text-red-600 bg-red-500/20 rounded-full p-2 transition hover:bg-gray-100 focus:outline-none"
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div>
              {" "}
              <button
                onClick={regenerateSummary}
                disabled={summaryLoading || !summaryData || !selectedTemplate}
                className="flex items-center text-s gap-2 border-2 border-primary-100 text-primary-500 bg-transparent rounded-full px-6 py-2 font-medium transition hover:bg-primary-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <RefreshCcw size={18} />
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Clear Confirmation Dialog */}
      {showClearConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Clear Summary
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to clear the saved summary? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearConfirmation(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={clearSavedSummary}
                className="bg-red-600 hover:bg-red-700"
              >
                Clear Summary
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NewTranscription;
