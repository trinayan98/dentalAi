import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { CheckCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifyEmail() {
  const { verifyEmail, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // For OTP input
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Auto-verify if token is present in URL
    if (token) {
      handleVerifyWithToken();
    }

    // Start countdown for resend option
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [token]);

  const handleVerifyWithToken = async () => {
    setIsVerifying(true);

    try {
      await verifyEmail(token);
      setIsVerified(true);
      addToast({
        title: "Email verified",
        description: "Your email has been successfully verified",
        type: "success",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      addToast({
        title: "Verification failed",
        description:
          error instanceof Error ? error.message : "Invalid or expired token",
        type: "error",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyWithOtp = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      addToast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit verification code",
        type: "error",
      });
      return;
    }

    setIsVerifying(true);

    try {
      await verifyEmail(otpString);
      setIsVerified(true);
      addToast({
        title: "Email verified",
        description: "Your email has been successfully verified",
        type: "success",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      addToast({
        title: "Verification failed",
        description:
          error instanceof Error ? error.message : "Invalid verification code",
        type: "error",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // In a real app, this would call an API to resend the code
      addToast({
        title: "Code resent",
        description: "A new verification code has been sent to your email",
        type: "success",
      });

      // Reset countdown
      setCountdown(60);
    } catch (error) {
      addToast({
        title: "Failed to resend code",
        description:
          error instanceof Error ? error.message : "Please try again later",
        type: "error",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <div className="mb-8">
        <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Verify your email
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isVerified
            ? "Your email has been verified successfully"
            : "We sent a verification code to your email"}
        </p>
      </div>

      {!isVerified ? (
        <>
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-xs">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
                Verification code
              </label>
              <div className="flex gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-9 h-12 text-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500"
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleVerifyWithOtp}
            variant="primary"
            size="lg"
            isLoading={isVerifying}
            fullWidth
            className="mb-4"
          >
            Verify Email
          </Button>

          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Didn't receive the code?{" "}
            {countdown > 0 ? (
              <span>Resend code in {countdown}s</span>
            ) : (
              <button
                onClick={handleResendCode}
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
              >
                Resend code
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="bg-success-50 dark:bg-success-900/30 p-6 rounded-lg mb-6">
          <CheckCircle className="h-12 w-12 text-success-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-success-800 dark:text-success-200">
            Email verified successfully
          </h3>
          <p className="text-success-600 dark:text-success-300">
            You will be redirected to the dashboard shortly.
          </p>
        </div>
      )}

      <Link
        to="/dashboard"
        className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
      >
        Go to Dashboard
      </Link>
    </motion.div>
  );
}
