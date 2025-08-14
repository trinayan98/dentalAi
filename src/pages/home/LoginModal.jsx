import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { Mail, Lock } from "lucide-react";

const LoginModal = ({ isOpen, onClose }) => {
  const { login, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

      // Close modal and redirect to dashboard
      onClose();
      reset();
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      addToast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        type: "error",
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      // title="Login"
      className="max-w-md"
    >
      <div className="space-y-5 p-3 py-4">
        <h1 className="text-xl font-extrabold text-teal-800 dark:text-white text-start">
          Login
          <p className="text-sm font-normal text-start py-0 pt-1 bg-gradient-to-r from-teal-700 via-blue-500 to-purple-800 bg-clip-text text-transparent animate-pulse">
            Enter your credentials to access your account
          </p>
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
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
            placeholder="Enter your password"
            leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
            error={errors.password?.message}
            className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
            {...register("password", {
              required: "Password is required",
            })}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-600 border-gray-300 rounded"
                {...register("rememberMe")}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>

            <Link
              to="/auth/forgot-password"
              className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400"
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
            className="mt-6 bg-teal-600 hover:bg-teal-700"
          >
            Login
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            Register here
          </Link>
        </p>
      </div>
    </Modal>
  );
};

export default LoginModal;
