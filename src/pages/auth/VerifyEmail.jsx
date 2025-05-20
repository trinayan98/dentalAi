import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { Button } from "../../components/ui/Button";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { verifyEmail, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, error

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        await verifyEmail(token);
        setVerificationStatus("success");
        addToast({
          title: "Email Verified Successfully",
          description:
            "Your email has been verified. You can now proceed to login.",
          type: "success",
        });
      } catch (error) {
        setVerificationStatus("error");
        addToast({
          title: "Verification Failed",
          description:
            error instanceof Error
              ? error.message
              : "Invalid or expired verification link",
          type: "error",
        });
      }
    };

    if (token) {
      verifyEmailToken();
    } else {
      setVerificationStatus("error");
      addToast({
        title: "Invalid Link",
        description: "The verification link is invalid or missing",
        type: "error",
      });
    }
  }, [token]);

  const renderContent = () => {
    switch (verificationStatus) {
      case "verifying":
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying your email...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success-600 dark:text-success-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your email has been verified. You can now proceed to login.
            </p>
            <Button variant="primary" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-error-100 dark:bg-error-900 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-error-600 dark:text-error-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The verification link is invalid or has expired. Please request a
              new verification email.
            </p>
            <Button variant="primary" onClick={() => navigate("/login")}>
              Back to Login
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex  justify-center px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          {renderContent()}
        </div>
      </div>
    </motion.div>
  );
}
