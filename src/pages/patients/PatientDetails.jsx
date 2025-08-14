import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/authStore";
import { API_BASE_URL } from "../../config/constants";
import {
  Cake,
  ChevronLeft,
  ChevronRight,
  FileText,
  Mail,
  User,
} from "lucide-react";
import { Clock, Phone } from "lucide-react";
import { Building2 } from "lucide-react";

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTranscription, setSelectedTranscription] = useState(null);

  // Fetch patient details
  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_BASE_URL}/patients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setPatient(response.data.data);
        if (response.data.data.transcriptions?.length > 0) {
          setSelectedTranscription(response.data.data.transcriptions[0]);
        }
      } else {
        setError("Failed to fetch patient details");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      setError(
        error?.response?.data?.message ||
          "Failed to fetch patient details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatientDetails();
    }
  }, [id]);

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get transcription status color
  const getTranscriptionStatusColor = (status) => {
    switch (status) {
      case "summarized":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100%]">
        <div className="flex items-center gap-3">
          <span className="material-icons animate-spin text-blue-600 text-2xl">
            refresh
          </span>
          <span className="text-lg text-gray-600">
            Loading patient details...
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
            onClick={() => navigate("/dashboard/patients")}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <span className="material-icons mr-2">arrow_back_ios_new</span>
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-icons text-gray-400 text-4xl mb-4">
            person
          </span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Patient not found
          </h3>
          <button
            onClick={() => navigate("/dashboard/patients")}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <span className="material-icons mr-2">arrow_back_ios_new</span>
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 ">
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard/patients")}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="mr-2" />
          Back to Patients
        </button>
      </div>
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-96 bg-gray-50 flex flex-col pr-6">
          {/* Patient Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <User />
              </div>
              <div>
                <h2 className="text-md font-bold text-gray-900">
                  {patient.fullName}
                </h2>
                <p className="text-s text-gray-500">{patient.patientId}</p>
              </div>
            </div>
            {/* <header className="flex justify-between items-center mb-8">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center hover:bg-blue-700 transition">
            <span className="material-icons mr-2">edit</span>
            Edit Patient
          </button>
        </header> */}
            <div className="space-y-4 text-s px-4">
              <div className="flex items-center text-gray-600">
                <Cake
                  size={16}
                  className="mr-2 text-gray-500"
                  strokeWidth={2.2}
                />
                <span>
                  Age: {patient.age || calculateAge(patient.dateOfBirth)}+{" "}
                  {patient.gender}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail
                  size={16}
                  className="mr-2 text-gray-600"
                  strokeWidth={2.2}
                />
                <span>{patient.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone
                  size={16}
                  strokeWidth={2.2}
                  className="mr-2 text-gray-500"
                />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Building2
                  size={16}
                  strokeWidth={2.2}
                  className="mr-2 text-gray-500"
                />
                <span>Department: {patient.department}</span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    patient.status
                  )}`}
                >
                  {patient.status}
                </span>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4">
                Statistics
              </h3>
              <div className="flex justify-between items-center text-s text-gray-600">
                <div className="flex items-center">
                  <FileText size={16} className="mr-2 text-gray-500" />
                  <span>Total Transcriptions</span>
                </div>
                <span className="font-bold text-gray-900">
                  {patient.transcriptionCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-s text-gray-600 mt-4">
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-500" />
                  <span>Member Since</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatDate(patient.createdAt).split(",")[0]}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 pt-0 overflow-y-auto">
          {/* Transcriptions */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-md font-semibold text-gray-900 mb-6">
              Transcriptions ({patient.transcriptions?.length || 0})
            </h2>

            {patient.transcriptions?.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-icons text-gray-400 text-4xl mb-4">
                  description
                </span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No transcriptions yet
                </h3>
                <p className="text-gray-600">
                  This patient hasn't had any transcription sessions yet.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Header Row */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="font-semibold text-sm text-gray-700">
                      Session ID
                    </div>
                    <div className="font-semibold text-sm text-gray-700">
                      Date & Time
                    </div>
                    <div className="font-semibold text-sm text-gray-700">
                      Session Type
                    </div>
                    <div className="font-semibold text-sm text-gray-700">
                      Visit Type
                    </div>
                    <div className="font-semibold text-sm text-gray-700">
                      Actions
                    </div>
                  </div>
                </div>

                {/* Data Rows */}
                <div className="divide-y divide-gray-200">
                  {patient.transcriptions?.map((transcription, index) => (
                    <div
                      key={transcription.sessionId}
                      className={`px-6 py-4 transition-colors hover:bg-gray-50 ${
                        selectedTranscription?.sessionId ===
                        transcription.sessionId
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                    >
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {transcription.sessionId}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(transcription.sessionDate)}
                        </div>
                        <div className="text-sm text-gray-900 capitalize">
                          {transcription.sessionType}
                        </div>
                        <div className="text-sm text-gray-900 capitalize">
                          {transcription.visitType}
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/dashboard/patients/${id}/transcription/${transcription.sessionId}`
                              );
                            }}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Transcription Details */}
          {/* {selectedTranscription && (
            <div className="bg-white p-6 rounded-xl shadow-sm">

              {selectedTranscription.summary && (
                <div className="space-y-6 text-gray-600 leading-relaxed">
                  <div className="flex justify-between items-center mb-2 border-b pb-4">
                    <h2 className="text-md font-semibold text-gray-900">
                      Summary
                    </h2>
                  </div>
                  {Object.entries(
                    selectedTranscription.summary.structuredSummary
                  ).map(([key, section]) => (
                    <div key={key}>
                      <h4 className="font-medium text-sm text-gray-800 mb-1">
                        {section.title}
                      </h4>
                      <p className="text-s text-gray-600">{section.content}</p>
                    </div>
                  ))}
                </div>
              )}


              {selectedTranscription.utterances && (
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-900 mb-4 border-b-2 pb-4">
                    Conversation
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedTranscription.utterances.map(
                      (utterance, index) => (
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
                          <p className="text-s text-gray-700">
                            {utterance.text}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )} */}
        </main>
      </div>
    </div>
  );
};

export default PatientDetails;
