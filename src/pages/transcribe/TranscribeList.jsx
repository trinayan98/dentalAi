import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Search,
  Calendar,
  Tag,
  MoreVertical,
  FileEdit,
  Copy,
  Trash,
  Download,
  Eye,
  List,
  Grid,
  Clock,
  ChevronRight,
  Edit,
  Delete,
  Mic,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useTranscribeStore } from "../../stores/transcribeStore";
import { useToastStore } from "../../stores/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { generateTranscriptionPdf } from "../../utils/pdfGenerator";

export default function TranscribeList() {
  const navigate = useNavigate();
  const {
    transcriptions,
    fetchTranscriptions,
    deleteTranscription,
    isLoading,
  } = useTranscribeStore();
  const { addToast } = useToastStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const fetchTranscriptionsData = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortBy,
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter !== "all" && { status: statusFilter }),
        });

        const response = await fetchTranscriptions(queryParams);
        if (response?.pagination) {
          setTotalPages(response.pagination.pages);
        }
        if (initialLoad) {
          setInitialLoad(false);
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to fetch transcriptions",
          type: "error",
        });
        if (initialLoad) {
          setInitialLoad(false);
        }
      }
    };

    const timeoutId = setTimeout(
      () => {
        fetchTranscriptionsData();
      },
      initialLoad ? 0 : 500
    );

    return () => clearTimeout(timeoutId);
  }, [
    currentPage,
    itemsPerPage,
    sortBy,
    searchTerm,
    statusFilter,
    initialLoad,
  ]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeDropdown]);

  const handleDeleteTranscription = async (id) => {
    if (window.confirm("Are you sure you want to delete this transcription?")) {
      try {
        await deleteTranscription(id);
        addToast({
          title: "Transcription deleted",
          description: "The transcription has been permanently deleted",
          type: "success",
        });
      } catch (error) {
        addToast({
          title: "Delete failed",
          description:
            error instanceof Error
              ? error.message
              : "Could not delete the transcription",
          type: "error",
        });
      }
    }
  };

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Filter and sort transcriptions
  const filteredTranscriptions = transcriptions
    .filter((transcription) => {
      const matchesSearch =
        (transcription.title &&
          transcription.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (transcription.transcription &&
          transcription.transcription
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" || transcription.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else {
        // Default to sorting by title
        return (a.title || "").localeCompare(b.title || "");
      }
    });

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-300">
          My Transcriptions
        </span>{" "}
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="w-full lg:w-72">
          <Input
            placeholder="Search transcriptions..."
            leftIcon={<Search className="h-4 w-4 text-gray-400" />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-50 border-0 w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)]">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Status :
            </span>
            <select
              className="bg-transparent border-0 text-xxs text-gray-900 focus:outline-none focus:ring-0 cursor-pointer px-2"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)]">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Sort by :
            </span>
            <select
              className="bg-transparent border-0 text-xxs text-gray-900 focus:outline-none focus:ring-0 cursor-pointer px-2"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Recent</option>
              <option value="oldest">Oldest</option>
              <option value="title">Name</option>
            </select>
          </div>

          <div className="flex rounded-md overflow-hidden shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)]">
            <button
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-gray-100 text-gray-900"
                  : "bg-white text-gray-500"
              }`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-gray-100 text-gray-900"
                  : "bg-white text-gray-500"
              }`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Link
            to="/dashboard/transcribe/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-xxs font-medium rounded-md hover:bg-primary-700 transition-colors gap-2 whitespace-nowrap"
          >
            <PlusCircle className="h-3 w-3" />
            New Transcription
          </Link>
        </div>
      </div>

      {/* Transcription list */}
      {isLoading && initialLoad ? (
        <div className="py-12 flex justify-center">
          <div className="animate-pulse space-y-8 w-full">
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : filteredTranscriptions.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
          <Mic className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No transcriptions found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm
              ? "No transcriptions match your search criteria"
              : "Create your first transcription to get started"}
          </p>
          {!searchTerm && (
            <Button
              as={Link}
              to="/dashboard/transcribe/create"
              variant="primary"
              leftIcon={<PlusCircle className="h-5 w-5" />}
            >
              New Transcription
            </Button>
          )}
        </div>
      ) : (
        <AnimatePresence>
          {viewMode === "grid" ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filteredTranscriptions.map((transcription) => (
                <motion.div
                  key={transcription._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Card className="flex flex-col h-full">
                    <div className="relative w-full">
                      {/* <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Mic className="h-12 w-12 text-gray-400" />
                      </div> */}
                    </div>
                    <div className="flex flex-col flex-grow p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span className="text-2xs">
                            {new Date(
                              transcription.createdAt
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-1 rounded-full ${
                            transcription.status === "completed"
                              ? "bg-green-50 text-green-700"
                              : transcription.status === "processing"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {transcription.status.charAt(0).toUpperCase() +
                            transcription.status.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {transcription.title}
                      </h3>
                      <p className="text-xxs text-gray-600 dark:text-gray-400 line-clamp-2 flex-grow">
                        {transcription.transcription?.substring(0, 150) + "..."}
                      </p>
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/dashboard/transcription/${transcription._id}`}
                          className="inline-flex px-4 py-2 bg-primary-50 pt-1 pb-1 text-primary-600 text-2xs rounded-md hover:text-white hover:bg-primary-700 transition-colors w-fit"
                        >
                          View Details
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => {
                              handleDeleteTranscription(transcription._id);
                              setActiveDropdown(null);
                            }}
                            className="p-2 text-error-600 dark:text-error-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/transcription/${transcription._id}`
                              )
                            }
                            className="p-2 text-primary-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) =>
                              toggleDropdown(e, transcription._id)
                            }
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeDropdown === transcription._id && (
                            <div className="absolute right-0 bottom-full mb-1 z-50 w-36 rounded-md bg-white dark:bg-gray-800 py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <button
                                className="flex items-center w-full px-4 py-1 text-xxs text-primary-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    window.location.origin +
                                      `/dashboard/transcription/${transcription._id}`
                                  );
                                  addToast({
                                    title: "Link copied",
                                    description:
                                      "Transcription link copied to clipboard",
                                    type: "success",
                                  });
                                  setActiveDropdown(null);
                                }}
                              >
                                <Copy className="h-3 w-3 mr-2" />
                                Copy Link
                              </button>
                              <button
                                className="flex items-center w-full px-4 py-2 text-xxs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={async () => {
                                  try {
                                    await generateTranscriptionPdf(
                                      transcription
                                    );
                                    addToast({
                                      title: "PDF Downloaded",
                                      description:
                                        "The transcription has been downloaded as PDF",
                                      type: "success",
                                    });
                                  } catch (error) {
                                    addToast({
                                      title: "Download Failed",
                                      description: "Failed to generate PDF",
                                      type: "error",
                                    });
                                  }
                                  setActiveDropdown(null);
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filteredTranscriptions.map((transcription) => (
                <Card
                  key={transcription._id}
                  className="hover:shadow-md transition-shadow"
                  hoverable
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Mic className="h-12 w-12 text-gray-400" />
                      </div> */}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${
                              transcription.status === "completed"
                                ? "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300"
                                : transcription.status === "processing"
                                ? "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300"
                                : "bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300"
                            }`}
                          >
                            {transcription.status.charAt(0).toUpperCase() +
                              transcription.status.slice(1)}
                          </span>
                          <div className="relative">
                            <button
                              onClick={(e) =>
                                toggleDropdown(e, transcription._id)
                              }
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>

                            {activeDropdown === transcription._id && (
                              <div className="absolute right-0 bottom-full mb-1 z-50 w-48 rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <Link
                                  to={`/dashboard/transcription/${transcription._id}`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                                <Link
                                  to={`/dashboard/transcription/${transcription._id}`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <FileEdit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      window.location.origin +
                                        `/dashboard/transcription/${transcription._id}`
                                    );
                                    addToast({
                                      title: "Link copied",
                                      description:
                                        "Transcription link copied to clipboard",
                                      type: "success",
                                    });
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </button>
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => {
                                    handleDeleteTranscription(
                                      transcription._id
                                    );
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {transcription.audioFileName}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                          {transcription.transcription?.substring(0, 200) +
                            "..."}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(
                              transcription.createdAt
                            ).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            {transcription.language || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
