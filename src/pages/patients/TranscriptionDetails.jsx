import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/authStore";
import { API_BASE_URL } from "../../config/constants";
import { ChevronLeft, FileText, Clock, User } from "lucide-react";

const TranscriptionDetails = () => {
  const { id: patientId, transcriptionId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [transcription, setTranscription] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch transcription details
  const fetchTranscriptionDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/patients/${patientId}/transcriptions/${transcriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setTranscription(response.data.data);
      } else {
        setError("Failed to fetch transcription details");
      }
    } catch (error) {
      console.error("Error fetching transcription details:", error);
      setError(
        error?.response?.data?.message ||
          "Failed to fetch transcription details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient details for context
  const fetchPatientDetails = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/patients/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPatient(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  useEffect(() => {
    if (patientId && transcriptionId) {
      fetchTranscriptionDetails();
      fetchPatientDetails();
    }
  }, [patientId, transcriptionId]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <span className="material-icons animate-spin text-blue-600 text-2xl">
            refresh
          </span>
          <span className="text-lg text-gray-600">
            Loading transcription details...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-icons text-red-500 text-4xl mb-4">
            error
          </span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/dashboard/patients/${patientId}`)}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <span className="material-icons mr-2">arrow_back_ios_new</span>
            Back to Patient
          </button>
        </div>
      </div>
    );
  }

  if (!transcription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-icons text-gray-400 text-4xl mb-4">
            description
          </span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Transcription not found
          </h3>
          <button
            onClick={() => navigate(`/dashboard/patients/${patientId}`)}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <span className="material-icons mr-2">arrow_back_ios_new</span>
            Back to Patient
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/dashboard/patients/${patientId}`)}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="mr-2" />
            Back to Patient
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Transcription Details
            </h1>
            {patient && (
              <p className="text-sm text-gray-600">
                Patient: {patient.fullName} ({patient.patientId})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transcription Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <FileText className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Session: {transcription.sessionId}
            </h2>
            <p className="text-sm text-gray-600">
              {formatDate(transcription.sessionDate)}
            </p>
          </div>
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-xs text-gray-500 mb-1">Session Type</p>
            <p className="font-medium text-sm text-gray-900 capitalize">
              {transcription.sessionType}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Visit Type</p>
            <p className="font-medium text-sm text-gray-900 capitalize">
              {transcription.visitType}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p className="font-medium text-sm text-gray-900 capitalize">
              {transcription.status || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Duration</p>
            <p className="font-medium text-sm text-gray-900">
              {transcription.visitDuration
                ? `${transcription.visitDuration} min`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Transcription Content */}
        {transcription.transcription && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">
              Transcription Text
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {transcription.transcription}
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        {transcription.summary && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">
              Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {transcription.summary}
              </p>
            </div>
          </div>
        )}

        {/* Structured Summary */}
        {transcription.summary?.structuredSummary && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">
              Structured Summary
            </h3>
            <div className="space-y-4">
              {Object.entries(transcription.summary.structuredSummary).map(
                ([key, section]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-gray-800 mb-2">
                      {section.title}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Utterances/Conversation */}
        {transcription.utterances && transcription.utterances.length > 0 && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">
              Conversation
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transcription.utterances.map((utterance, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    utterance.speaker === "A"
                      ? "bg-blue-50 ml-8"
                      : "bg-gray-50 mr-8"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      {utterance.speaker === "A" ? "Doctor" : "Patient"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.floor(utterance.start / 1000)}s
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{utterance.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality Metrics */}
        {transcription.qualityMetrics && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">
              Quality Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  {(
                    transcription.qualityMetrics.transcriptionAccuracy * 100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-500">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  {(
                    transcription.qualityMetrics.medicalTermAccuracy * 100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-500">Medical Terms</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  {(
                    transcription.qualityMetrics.speakerIdentificationAccuracy *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-500">Speaker ID</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  {(transcription.qualityMetrics.completeness * 100).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-500">Completeness</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionDetails;
