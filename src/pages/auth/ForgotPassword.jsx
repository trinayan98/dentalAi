import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const { resetPassword, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
      addToast({
        title: "Recovery email sent",
        description: "Check your inbox for password reset instructions",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Failed to send recovery email",
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
      className="w-full max-w-xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forgot password?
          </h2>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
            {isSubmitted
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
              error={errors.email?.message}
              className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
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
              Send Reset Link
            </Button>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className=" text-sm inline-flex items-center font-medium text-[#1850F0] hover:text-blue-600 dark:text-blue-400"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-[#1850F0] dark:text-blue-400" />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Check your email
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                We've sent a password reset link to your email address. Please
                check your inbox.
              </p>
            </div>

            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              size="sm"
              fullWidth
              className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Try another email
            </Button>

            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-[#1850F0] hover:text-blue-600 dark:text-blue-400"
              >
                Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
