import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import NavBar from "../../components/NavBar";
import LoginModal from "./LoginModal";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const Signup = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
      addToast({
        title: "Registration successful",
        description: "Welcome to AI Dental Scribe!",
        type: "success",
      });
      navigate("/dashboard");
    } catch (error) {
      addToast({
        title: "Registration failed",
        description: error.message || "Registration failed",
        type: "error",
      });
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, color: "gray", text: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const colors = ["red", "orange", "yellow", "lightgreen", "green"];
    const texts = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

    return {
      strength: Math.min(strength, 5),
      color: colors[strength - 1] || "gray",
      text: texts[strength - 1] || "",
    };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="max-h-[100%] relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-teal-200/30 dark:bg-teal-800/20 rounded-full animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-blue-200/30 dark:bg-blue-800/20 rounded-full animate-float-fast"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-purple-200/30 dark:bg-purple-800/20 rounded-full animate-float-slow"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-pink-200/30 dark:bg-pink-800/20 rounded-full animate-float-medium"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-yellow-200/30 dark:bg-yellow-800/20 rounded-full animate-float-fast"></div>

        <div className="absolute top-1/4 left-1/2 w-32 h-32 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 dark:from-teal-600/10 dark:to-emerald-600/10 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-xl animate-pulse-medium"></div>

        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
      </div>

      <NavBar onLoginClick={() => setIsLoginModalOpen(true)} />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <main className="pt-8">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-full xxl:px-60 lg:px-40 md:px-20 px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-1">
                Join <span className="text-teal-700">AI Dental Scribe</span>
              </h1>
              <p className="text-base font-medium text-center py-0 pt-1 bg-gradient-to-r from-teal-700 via-blue-900 to-purple-800 bg-clip-text text-transparent animate-pulse">
                Create your account and start transforming your dental practice
                with AI-powered transcription and clinical notes.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Signup Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="p-8 py-10 shadow-lg relative">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                      <div className="flex flex-col gap-1">
                        <label className="block text-s font-bold text-teal-700 dark:text-gray-300 mb-1">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          leftIcon={<User className="h-4 w-4 text-gray-400" />}
                          error={errors.name?.message}
                          {...register("name", {
                            required: "Full name is required",
                          })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="block text-s font-bold text-teal-700 dark:text-gray-300 mb-1">
                          Username
                        </label>
                        <Input
                          type="text"
                          leftIcon={<User className="h-4 w-4 text-gray-400" />}
                          error={errors.username?.message}
                          {...register("username", {
                            required: "Username is required",
                            minLength: {
                              value: 3,
                              message: "Username must be at least 3 characters",
                            },
                          })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="block text-s font-bold text-teal-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                        error={errors.email?.message}
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                      />
                    </div>

                    <div className="relative">
                      <div className="flex flex-col gap-1">
                        <label className="block text-s font-bold text-teal-700 dark:text-gray-300 mb-1">
                          Password
                        </label>
                        <Input
                          type={showPassword ? "text" : "password"}
                          leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                          rightIcon={
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          }
                          error={errors.password?.message}
                          {...register("password", {
                            required: "Password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                          })}
                        />
                      </div>
                      {password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  passwordStrength.color === "red"
                                    ? "bg-red-500"
                                    : passwordStrength.color === "orange"
                                    ? "bg-orange-500"
                                    : passwordStrength.color === "yellow"
                                    ? "bg-yellow-500"
                                    : passwordStrength.color === "lightgreen"
                                    ? "bg-green-400"
                                    : passwordStrength.color === "green"
                                    ? "bg-green-600"
                                    : "bg-gray-300"
                                }`}
                                style={{
                                  width: `${
                                    (passwordStrength.strength / 5) * 100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {passwordStrength.text}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="block text-s font-bold text-teal-700 dark:text-gray-300 mb-1">
                        Confirm Password
                      </label>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        }
                        error={errors.confirmPassword?.message}
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        id="agree-terms"
                        type="checkbox"
                        className="h-4 w-4 text-teal-600 focus:ring-teal-600 border-gray-300 rounded mt-1"
                        {...register("agreeTerms")}
                      />
                      <label
                        htmlFor="agree-terms"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        I agree to the{" "}
                        <a
                          href="#"
                          className="text-teal-600 hover:text-teal-700"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="text-teal-600 hover:text-teal-700"
                        >
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                      fullWidth
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Create Account
                    </Button>
                  </form>

                  <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                      to="/auth/login"
                      className="font-medium text-teal-600 hover:text-teal-700"
                    >
                      Sign in
                    </Link>
                  </p>
                </Card>
              </motion.div>

              {/* Features Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className=" bg-gray-100/50 dark:bg-gray-800/50 rounded-lg px-10 py-8 backdrop-blur-sm"
              >
                <div className="text-center lg:text-left ">
                  <h2 className="text-xl font-bold text-teal-800 dark:text-white mb-3">
                    Why Choose AI Dental Scribe?
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm font-normal">
                    Join thousands of dental professionals who have already
                    streamlined their workflow.
                  </p>
                </div>

                <div className="space-y-0">
                  {[
                    {
                      icon: "mic",
                      iconColor: "purple",
                      title: "Voice Transcription",
                      description:
                        "Real-time conversion of patient conversations into accurate text transcripts with medical terminology recognition.",
                    },
                    {
                      icon: "psychology",
                      iconColor: "orange",
                      title: "AI-Powered Notes",
                      description:
                        "Intelligent generation of clinical notes using advanced AI technology trained on dental terminology and best practices.",
                    },
                    {
                      icon: "description",
                      iconColor: "red",
                      title: "Template System",
                      description:
                        "SOAP, Periodontal, Restorative, and custom note templates to match your practice workflow.",
                    },
                    {
                      icon: "lock",
                      iconColor: "yellow",
                      title: "HIPAA Compliant",
                      description:
                        "Secure, encrypted storage and processing of patient health information with full HIPAA compliance.",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 py-3 dark:bg-gray-800/50 "
                    >
                      <span
                        className={`material-icons text-${feature.iconColor}-600 dark:text-${feature.iconColor}-400`}
                        style={{ fontSize: "36px" }}
                      >
                        {feature.icon}
                      </span>

                      <div>
                        <h3 className="font-semibold text-sm text-gray-800 dark:text-white mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-s text-gray-600 dark:text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Signup;
