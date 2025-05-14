import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Upload,
  Mic,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Edit2,
  Sparkles,
  Check,
  Play,
  Pause,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { useTranscribeStore } from "../../stores/transcribeStore";
import { useToastStore } from "../../stores/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "./AudioPlayerCustom.css";

const STAGES = {
  UPLOAD: "upload",
  PROCESSING: "processing",
  REVIEW: "review",
};

export default function CreateTranscription() {
  const navigate = useNavigate();
  const { createTranscription } = useTranscribeStore();
  const { addToast } = useToastStore();
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      transcription: "",
      language: "en",
      tags: "",
      notes: "",
    },
  });

  const [currentStage, setCurrentStage] = useState(STAGES.UPLOAD);
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState("uploading");
  const [fileError, setFileError] = useState("");
  const [chatId] = useState(() => {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  const ALLOWED_AUDIO_TYPES = [
    "audio/flac",
    "audio/m4a",
    "audio/mp3",
    "audio/mp4",
    "audio/mpeg",
    "audio/mpga",
    "audio/oga",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
  ];

  const cleanupAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl("");
  };

  const sendAudioToWebhook = async (file) => {
    try {
      setUploadStatus("uploading");
      const formData = new FormData();
      formData.append("audioFile", file);
      formData.append("chatId", chatId);

      const response = await fetch(
        "https://n8n.apisdor.com/webhook/37d0103a-0a5d-49d7-ac89-6688b0d52097",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send audio file");
      }

      const data = await response.json();
      if (data && data[0] && data[0].transcribedText) {
        setValue("transcription", data[0].transcribedText);
      }

      setUploadStatus("success");
      cleanupAudio(); // Clean up audio after successful API call
      return data;
    } catch (error) {
      console.error("Error sending audio file:", error);
      setUploadStatus("error");
      addToast({
        title: "Upload Failed",
        description:
          error.message || "Failed to send audio file. Please try again.",
        type: "error",
      });
      throw error;
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const tagsArray = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        title: data.title,
        transcription: data.transcription,
        language: data.language,
        tags: tagsArray,
        notes: data.notes,
      };

      await createTranscription(payload);
      addToast({
        title: "Success",
        description: "Transcription created successfully",
        type: "success",
      });
      navigate(`/dashboard/transcriptions`);
    } catch (error) {
      addToast({
        title: "Error",
        description: error.message || "Failed to create transcription",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [recordingTimer, isRecording]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileError(""); // Clear any previous errors

    if (file) {
      if (ALLOWED_AUDIO_TYPES.includes(file.type)) {
        setAudioFile(file);
      } else {
        setFileError(
          "Invalid file type. Please upload a valid audio file (FLAC, M4A, MP3, MP4, MPEG, MPGA, OGA, OGG, WAV, or WEBM)"
        );
        addToast({
          title: "Invalid file type",
          description:
            "Please upload a valid audio file (FLAC, M4A, MP3, MP4, MPEG, MPGA, OGA, OGG, WAV, or WEBM)",
          type: "error",
        });
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioFile = new File([audioBlob], "recording.wav", {
          type: "audio/wav",
        });
        setAudioFile(audioFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      const timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } catch (error) {
      addToast({
        title: "Recording failed",
        description: "Could not access microphone",
        type: "error",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
  };

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setAudioUrl("");
    }
  }, [audioFile]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const renderStepIndicator = () => {
    const steps = [
      { label: "Upload", icon: FileText },
      { label: "Processing", icon: Sparkles },
      { label: "Review", icon: Check },
    ];

    return (
      <div className="mb-6">
        <div className="flex justify-between relative">
          {/* Progress Line Container */}
          <div className="absolute top-4 left-[2rem] right-[2rem] h-[2px]">
            {/* Progress Line Background */}
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
            {/* Progress Line Overlay */}
            <div
              className="absolute left-0 h-full bg-primary-500 transition-all duration-300 ease-in-out"
              style={{
                width: `${
                  (Object.values(STAGES).indexOf(currentStage) /
                    (Object.values(STAGES).length - 1)) *
                  100
                }%`,
              }}
            />
          </div>

          {/* Steps */}
          {steps.map((s, index) => {
            const Icon = s.icon;
            const stage = Object.values(STAGES)[index];
            const isActive = currentStage === stage;
            const isCompleted =
              Object.values(STAGES).indexOf(currentStage) > index;

            return (
              <div
                key={s.label}
                className="flex flex-col items-center relative z-3"
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                    ${
                      isCompleted
                        ? "bg-primary-500 text-white"
                        : isActive
                        ? "bg-primary-500 text-white ring-4 ring-primary-50"
                        : "bg-white text-gray-400 border-2 border-gray-200"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-[11px] font-medium transition-colors duration-200
                    ${
                      isCompleted
                        ? "text-primary-500"
                        : isActive
                        ? "text-primary-500"
                        : "text-gray-400"
                    }
                  `}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-transparent dark:bg-gray-900">
      <div className="flex items-center gap-2 text-xs mb-6">
        <span className="font-medium text-gray-500 dark:text-gray-300">
          Create Transcription
        </span>
        <ChevronRight className="h-3 w-3 text-gray-400" />
      </div>
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-transparent dark:bg-gray-900 rounded-0">
          {renderStepIndicator()}
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {currentStage === STAGES.UPLOAD && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="w-full"
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center mb-8">
                        <h2 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                          Upload Audio
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Upload an audio file or record directly
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upload Section */}
                        <div
                          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".flac,.m4a,.mp3,.mp4,.mpeg,.mpga,.oga,.ogg,.wav,.webm,audio/*"
                            className="hidden"
                          />
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                            Upload Audio File
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Supported formats: FLAC, M4A, MP3, MP4, MPEG, MPGA,
                            OGA, OGG, WAV, WEBM
                          </p>
                          <Button variant="outline" size="xs">
                            Select File
                          </Button>
                          {fileError && (
                            <div className="mt-4 p-3 bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-md">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-error-500" />
                                <p className="text-xs text-error-600 dark:text-error-400">
                                  {fileError}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Record Section */}
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                          <Mic className="h-8 w-8 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                            Record Audio
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Record audio directly in your browser
                          </p>
                          {!isRecording ? (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={startRecording}
                              leftIcon={<Mic className="h-4 w-4" />}
                            >
                              Start Recording
                            </Button>
                          ) : (
                            <div className="space-y-4">
                              <div className="text-xl font-mono">
                                {formatTime(recordingTime)}
                              </div>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={stopRecording}
                                className="text-error-600 hover:text-error-700"
                              >
                                Stop Recording
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {audioFile && (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded">
                                <Upload className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {audioFile.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setAudioFile(null)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
                              <X className="h-5 w-5 text-gray-500" />
                            </button>
                          </div>
                          <AudioPlayer
                            src={audioUrl}
                            showJumpControls={false}
                            customAdditionalControls={[]}
                            layout="horizontal"
                            style={{
                              borderRadius: "0.3rem",
                              background: "transparent",
                            }}
                          />
                        </div>
                      )}

                      <div className="mt-8 flex justify-end">
                        <Button
                          onClick={async () => {
                            try {
                              setIsSubmitting(true);
                              setCurrentStage(STAGES.PROCESSING);
                              await sendAudioToWebhook(audioFile);
                              // Wait for 2 seconds to show success state
                              setTimeout(() => {
                                setCurrentStage(STAGES.REVIEW);
                              }, 2000);
                            } catch (error) {
                              setCurrentStage(STAGES.UPLOAD);
                            } finally {
                              setIsSubmitting(false);
                            }
                          }}
                          disabled={!audioFile || isSubmitting}
                          size="xs"
                          rightIcon={
                            isSubmitting ? (
                              <Loader2 className="h-3.5 w-3.5 ml-1 animate-spin" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            )
                          }
                        >
                          {isSubmitting ? "Sending..." : "Continue"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStage === STAGES.PROCESSING && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="max-w-xl mx-auto text-center"
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-8">
                        {/* <div className="inline-block p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                          {uploadStatus === "uploading" ? (
                            <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
                          ) : uploadStatus === "success" ? (
                            <CheckCircle2 className="h-8 w-8 text-success-600 dark:text-success-400" />
                          ) : (
                            <AlertCircle className="h-8 w-8 text-error-600 dark:text-error-400" />
                          )}
                        </div> */}
                        <h2 className="text-md font-bold text-gray-900 dark:text-white mb-1">
                          {uploadStatus === "uploading"
                            ? "Processing Audio"
                            : uploadStatus === "success"
                            ? "Processing Complete"
                            : "Processing Failed"}
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {uploadStatus === "uploading"
                            ? "This may take a few minutes depending on the file size"
                            : uploadStatus === "success"
                            ? "Your audio has been successfully processed"
                            : "There was an error processing your audio"}
                        </p>
                      </div>

                      <div className="max-w-md mx-auto">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded ${
                                uploadStatus === "success"
                                  ? "bg-success-100 dark:bg-success-900/30"
                                  : "bg-primary-100 dark:bg-primary-900/30"
                              }`}
                            >
                              {uploadStatus === "success" ? (
                                <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400" />
                              ) : (
                                <Loader2 className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-spin" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {uploadStatus === "success"
                                  ? "File processed successfully"
                                  : "Processing audio file"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {uploadStatus === "success"
                                  ? "Ready for review"
                                  : "Converting speech to text..."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* <div className="mt-8 flex justify-between">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setCurrentStage(STAGES.UPLOAD)}
                          leftIcon={
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                          }
                        >
                          Back
                        </Button>
                        {uploadStatus === "success" && (
                          <Button
                            size="xs"
                            onClick={() => setCurrentStage(STAGES.REVIEW)}
                            rightIcon={
                              <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            }
                          >
                            Continue
                          </Button>
                        )}
                      </div> */}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStage === STAGES.REVIEW && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="min-w-full mx-auto"
                >
                  <Card>
                    <CardContent className="p-6">
                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <div className="mb-6">
                          <h2 className="text-md font-bold text-gray-900 dark:text-white mb-1">
                            Review & Edit
                          </h2>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Review and edit the transcription before saving
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xxs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Title <span className="text-error-500">*</span>
                            </label>
                            <Input
                              {...register("title", {
                                required: "Title is required",
                              })}
                              className={errors.title ? "border-error-500" : ""}
                              placeholder="Enter a title for your transcription"
                            />
                            {errors.title && (
                              <p className="mt-1 text-xs text-error-500">
                                {errors.title.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xxs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Transcription{" "}
                              <span className="text-error-500">*</span>
                            </label>
                            <Textarea
                              {...register("transcription", {
                                required: "Transcription is required",
                              })}
                              className={`text-xs ${
                                errors.transcription ? "border-error-500" : ""
                              }`}
                              placeholder="Edit the transcription text"
                              rows={6}
                            />
                            {errors.transcription && (
                              <p className="mt-1 text-xs text-error-500">
                                {errors.transcription.message}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xxs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Language
                              </label>
                              <select
                                {...register("language")}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xxs focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                            </div>

                            <div>
                              <label className="block text-xxs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tags
                              </label>
                              <Input
                                {...register("tags")}
                                placeholder="Enter tags (comma-separated)"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xxs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Notes
                            </label>
                            <Textarea
                              {...register("notes")}
                              placeholder="Add any additional notes"
                              rows={3}
                              className="text-xs"
                            />
                          </div>
                        </div>

                        <div className="mt-8 flex justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setCurrentStage(STAGES.PROCESSING)}
                            leftIcon={
                              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                            }
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            size="xs"
                            disabled={isSubmitting}
                            leftIcon={
                              isSubmitting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : null
                            }
                          >
                            {isSubmitting ? "Saving..." : "Save Transcription"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
