import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { User, Mail, Lock, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SignUp() {
  const { signup, isLoading } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
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

    try {
      await signup(data.name, data.email, data.password);
      navigate("/dashboard");
      addToast({
        title: "Account created",
        description: "Welcome to BlogGenius!",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Sign up failed",
        description:
          error instanceof Error ? error.message : "Could not create account",
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
            className=" border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
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
              src="https://www.svgrepo.com/show/452196/facebook-1.svg"
              alt="Facebook"
            />
            Continue with Facebook
          </Button>
        </div> */}

        {/* <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Or continue with email
            </span>
          </div>
        </div> */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Input
              label="Full Name"
              leftIcon={<User className="h-4 w-4 text-gray-400" />}
              error={errors.name?.message}
              className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              {...register("name", {
                required: "Name is required",
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
              <Input
                label="Password"
                type="password"
                leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                error={errors.password?.message}
                className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />

              {password && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Password strength
                    </span>
                    <span
                      className={`text-xxs font-medium ${
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
          </div>

          <div className="flex items-start">
            <div className="flex items-center h4">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register("agreeTerms", {
                  required: true,
                })}
              />
            </div>
            <div className="ml-3 text-xs">
              <label
                htmlFor="terms"
                className={`text-xs font-medium ${
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
            className="mt-6"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
