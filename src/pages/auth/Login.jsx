import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const { login, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      addToast({
        title: "Login successful",
        description: "Welcome back!",
        type: "success",
      });

      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      addToast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Button
            type="button"
            variant="outline"
            fullWidth
            className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
          >
            <img
              className="h-4 w-4 mr-3"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
            />
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
          >
            <img
              className="h-4 w-4 mr-3"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png"
              alt="Microsoft"
            />
            Continue with Microsoft
          </Button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              or
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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

            <Input
              label="Password"
              type="password"
              leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
              error={errors.password?.message}
              className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              {...register("password", {
                required: "Password is required",
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#1850F0] focus:ring-[#1850F0] border-gray-300 rounded"
                {...register("rememberMe")}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-xs text-gray-700 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-xs text-[#1850F0] hover:text-blue-600 dark:text-blue-400"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            fullWidth
            className="mt-6 bg-[#1850F0] hover:bg-blue-600"
          >
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-[#1850F0] hover:text-blue-600 dark:text-blue-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
