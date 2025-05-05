import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function SignUp() {
  const { signup, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    if (!data.agreeTerms) {
      addToast({
        title: "Agreement required",
        description: "You must agree to the terms and privacy policy",
        type: "error",
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      addToast({
        title: "Password mismatch",
        description: "Password and confirmation do not match",
        type: "error",
      });
      return;
    }

    try {
      await signup(data.username, data.email, data.password, data.name);
      navigate("/login");
      addToast({
        title: "Registration successful",
        description: "Welcome to BlogGenius!",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Registration failed",
        description: error.message || "Registration failed",
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
      className="w-full max-w-xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
        {/* <div className="grid grid-cols-1 gap-6 mb-8">
          <Button
            type="button"
            variant="outline"
            fullWidth
            className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
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
            className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
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
        </div>*/}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <Input
              label="Full Name"
              leftIcon={<User className="h-4 w-4 text-gray-400" />}
              error={errors.name?.message}
              className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              {...register("name", {
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
            />

            <Input
              label="Username"
              leftIcon={<User className="h-4 w-4 text-gray-400" />}
              error={errors.username?.message}
              className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
            />

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

            <div className="space-y-2">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  error={errors.password?.message}
                  className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 pr-10"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[31px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {password && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
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
              )}
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                error={errors.confirmPassword?.message}
                className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 pr-10"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[31px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-4">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register("agreeTerms", {
                  required: true,
                })}
              />
            </div>
            <div className="ml-3 text-xxs">
              <label
                htmlFor="terms"
                className={`text-xss font-medium ${
                  errors.agreeTerms
                    ? "text-error-600 dark:text-error-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Privacy Policy
                </a>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                  You must agree to continue
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            fullWidth
            className="mt-4 bg-[#1850F0] hover:bg-blue-600"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-xxs text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-[#1850F0] hover:text-blue-600 dark:text-primary-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
