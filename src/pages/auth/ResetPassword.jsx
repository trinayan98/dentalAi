import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { Lock, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const { setNewPassword, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

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
    if (!token) {
      addToast({
        title: "Invalid or expired link",
        description: "Please request a new password reset link",
        type: "error",
      });
      return;
    }

    try {
      await setNewPassword(data.password, token);
      addToast({
        title: "Password reset successful",
        description: "You can now login with your new password",
        type: "success",
      });
      navigate("/login");
    } catch (error) {
      addToast({
        title: "Password reset failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        type: "error",
      });
    }
  };

  const getPasswordStrength = (password) => {
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

  const passwordStrength = getPasswordStrength(password);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reset password
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="New Password"
            type="password"
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />

          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Password strength
                </span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm New Password"
          type="password"
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          fullWidth
          className="mt-6"
        >
          Reset Password
        </Button>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Back to login
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
