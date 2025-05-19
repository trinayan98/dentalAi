import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToastStore } from "../../stores/toastStore";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { authApi } from "../../utils/api";

const PasswordStrengthIndicator = ({ password, isFocused }) => {
  if (!isFocused && !password) return null;

  const getStrength = (password) => {
    if (!password) {
      return {
        strength: 0,
        label: "None",
        color: "bg-gray-300 dark:bg-gray-600",
      };
    }

    let strength = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    strength = checks.filter(Boolean).length;

    if (strength <= 2) {
      return { strength: 2, label: "Weak", color: "bg-error-500" };
    } else if (strength <= 4) {
      return { strength: 3, label: "Medium", color: "bg-warning-500" };
    } else {
      return { strength: 5, label: "Strong", color: "bg-success-500" };
    }
  };

  const passwordStrength = getStrength(password);

  return (
    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xs font-medium text-gray-700 dark:text-gray-300">
          Password strength
        </span>
        <span
          className={`text-2xs font-medium ${
            passwordStrength.label === "Strong"
              ? "text-success-600 dark:text-success-400"
              : passwordStrength.label === "Medium"
              ? "text-warning-600 dark:text-warning-400"
              : "text-error-600 dark:text-error-400"
          }`}
        >
          {passwordStrength.label}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${passwordStrength.color} transition-all duration-300`}
          style={{
            width: `${(passwordStrength.strength / 5) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default function ResetPassword() {
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    const token = searchParams.get("token");
    if (!token) {
      addToast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or has expired.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, data.password);
      setIsSuccess(true);
      addToast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully.",
        type: "success",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      addToast({
        title: "Password Reset Failed",
        description: error.message || "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      addToast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or has expired.",
        type: "error",
      });
      navigate("/forgot-password");
    }
  }, [searchParams, addToast, navigate]);

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl mx-auto"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Password Reset Successful
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Your password has been reset successfully. You will be redirected to
            the login page shortly.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-[#1850F0] hover:text-blue-600 dark:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go to Login
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Reset Your Password
          </h2>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
            Please enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
            error={errors.password?.message}
            className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          <PasswordStrengthIndicator
            password={password}
            isFocused={isPasswordFocused}
          />

          <Input
            label="Confirm Password"
            type="password"
            leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
            error={errors.confirmPassword?.message}
            className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            fullWidth
            className="mt-6 bg-[#1850F0] hover:bg-blue-600 text-white"
          >
            Reset Password
          </Button>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm inline-flex items-center font-medium text-[#1850F0] hover:text-blue-600 dark:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
