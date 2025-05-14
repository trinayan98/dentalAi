import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Save,
  X,
  Download,
  Copy,
  Trash,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Tag,
  FileText,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { useTranscribeStore } from "../../stores/transcribeStore";
import { useToastStore } from "../../stores/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

// Utility function to prettify medical transcription and highlight section headers
function prettifyTranscription(text) {
  if (!text) return "";

  // Highlight section headers (text between **...**)
  let formatted = text.replace(/\*\*(.+?)\*\*/g, (match, p1) => {
    return `<span class='transcription-section-header'>${p1}</span>`;
  });

  // Add a single line break after section headers
  formatted = formatted.replace(
    /(<span class='transcription-section-header'>.+?<\/span>)/g,
    "$1<br>"
  );

  // Convert all remaining newlines to <br>
  // formatted = formatted.replace(/\n/g, "<br>");

  // Remove leading/trailing whitespace
  formatted = formatted.trim();

  return formatted;
}

export default function TranscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchTranscription, updateTranscription, deleteTranscription } =
    useTranscribeStore();
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    transcription: "",
    language: "en",
    tags: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTranscription(id);
        setTranscription(data);
        setFormData({
          title: data.title || "",
          transcription: data.transcription || "",
          language: data.language || "en",
          tags: data.tags?.join(", ") || "",
          notes: data.notes || "",
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to fetch transcription",
          type: "error",
        });
        navigate("/dashboard/transcriptions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, fetchTranscription, addToast, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };
      await updateTranscription(id, updatedData);
      setTranscription((prev) => ({ ...prev, ...updatedData }));
      setIsEditing(false);
      addToast({
        title: "Success",
        description: "Transcription updated successfully",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: error.message || "Failed to update transcription",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this transcription?")) {
      setIsDeleting(true);
      try {
        await deleteTranscription(id);
        addToast({
          title: "Success",
          description: "Transcription deleted successfully",
          type: "success",
        });
        navigate("/dashboard/transcribe");
      } catch (error) {
        addToast({
          title: "Error",
          description: error.message || "Failed to delete transcription",
          type: "error",
        });
        setIsDeleting(false);
      }
    }
  };

  const [audioElement, setAudioElement] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioElement) {
      audioElement.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioElement) {
      const newMuted = !isMuted;
      audioElement.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(1);
      }
    }
  };

  const handleTimeChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioElement) {
      audioElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span>Loading...</span>
      </div>
    );
  }

  if (!transcription) return null;

  return (
    <div className="max-w-full space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs ">
        <button
          onClick={() => navigate("/dashboard/transcriptions")}
          className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          My Transcriptions
        </button>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <span className="text-gray-900 dark:text-white">
          {transcription.title || "Transcription"}
        </span>
      </div>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-md font-semibold text-gray-900 dark:text-white">
              {!isEditing && transcription.title}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(transcription.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {transcription.language || "Unknown"}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {transcription.status || "Unknown"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      title: transcription.title || "",
                      transcription: transcription.transcription || "",
                      language: transcription.language || "en",
                      tags: transcription.tags?.join(", ") || "",
                      notes: transcription.notes || "",
                    });
                  }}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      window.location.origin + `/dashboard/transcribe/${id}`
                    );
                    addToast({
                      title: "Link copied",
                      description: "Transcription link copied to clipboard",
                      type: "success",
                    });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-error-600 hover:text-error-700"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Audio Player */}
        {/* {transcription.audioUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayPause}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-primary-600" />
                ) : (
                  <Play className="h-6 w-6 text-primary-600" />
                )}
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleTimeChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  // Handle download
                  const link = document.createElement("a");
                  link.href = transcription.audioUrl;
                  link.download = transcription.audioFileName || "audio.wav";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )} */}

        {/* Transcription Content */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="text-2xl font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transcription
                </label>
                {isEditing ? (
                  <Textarea
                    name="transcription"
                    value={formData.transcription}
                    onChange={handleInputChange}
                    rows={10}
                    className="font-mono"
                  />
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm whitespace-pre-wrap dark:text-gray-100">
                    <style>{`.transcription-section-header { background: #e0f2fe; color: #0c4a6e; padding: 1px 4px; border-radius: 4px; font-weight: bold; display: inline-block; margin-bottom: 0.1em; }`}</style>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: prettifyTranscription(
                          transcription.transcription
                        ),
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  {isEditing ? (
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                    </select>
                  ) : (
                    <div className="p-2 bg-gray-50 dark:text-gray-100 rounded-lg text-xs dark:bg-gray-700">
                      {transcription.language || "Unknown"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  {isEditing ? (
                    <Input
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Enter tags (comma-separated)"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {transcription.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xxs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                {isEditing ? (
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Add any additional notes"
                  />
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm whitespace-pre-wrap dark:text-gray-100">
                    {transcription.notes || "No notes"}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
