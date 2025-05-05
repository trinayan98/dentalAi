import { Outlet, useLocation } from "react-router-dom";
import {
  Check,
  Pen,
  Sparkles,
  Target,
  Zap,
  Shield,
  BookOpen,
  Rocket,
  Lightbulb,
  Users,
  Laptop,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "../components/ThemeToggle";

// Import workspace image
const workspaceImg = new URL(
  "https://img.freepik.com/free-photo/man-is-using-laptop-books-notebook-top-view_169016-49211.jpg?ga=GA1.1.1194710755.1726822523&semt=ais_hybrid&w=740",
  import.meta.url
).href;

const signUpFeatures = [
  {
    title: "AI-Powered Writing",
    description: "Generate high-quality blog posts instantly",
    icon: Sparkles,
  },
  {
    title: "SEO Optimization",
    description: "Rank higher in search results",
    icon: Target,
  },
  {
    title: "Easy Integration",
    description: "Works with your favorite platforms",
    icon: Zap,
  },
];

const authFeatures = [
  {
    title: "Secure Access",
    description: "Your data is protected with enterprise-grade security",
    icon: Shield,
  },
  {
    title: "Smart Collaboration",
    description: "Work together with your team seamlessly",
    icon: Users,
  },
  {
    title: "Privacy First",
    description: "Your content, your control, always protected",
    icon: Lock,
  },
];

export default function AuthLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isForgotPassword = location.pathname === "/forgot-password";
  const isSignUpPage = location.pathname === "/signup";

  const currentFeatures = isSignUpPage ? signUpFeatures : authFeatures;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header - Logo and Theme Toggle */}
      <div className="w-full px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Pen className="h-8 w-8 text-[#1850F0]" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            BlogGenius
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Branding and info */}
        <div className="w-full md:w-1/2 flex flex-col justify-normal items-center lg:items-end">
          <div className="w-full max-w-xl lg:max-w-none lg:w-[520px] lg:mr-0 px-4 sm:px-6 md:px-8 lg:px-16 py-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <h1
                  className={`text-xl font-bold ${
                    isSignUpPage ? "text-[#1850F0]" : "text-[#1850F0]"
                  } dark:text-blue-500`}
                >
                  {isSignUpPage
                    ? "Create your account"
                    : isForgotPassword
                    ? "Password Recovery"
                    : "Welcome back"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isSignUpPage
                    ? "Join BlogGenius and start creating AI-powered blog content"
                    : isForgotPassword
                    ? "We'll help you get back to creating amazing content"
                    : "Sign in to continue your content creation journey"}
                </p>
              </div>

              <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {/* <div className="absolute top-0 left-0 bg-[#1850F0] text-white text-xs px-2 py-1 z-10">
                  {isForgotPassword ? "RECOVERY" : "WORKSPACE"}
                </div> */}
                <div className="aspect-[16/10] w-full">
                  {workspaceImg ? (
                    isLoginPage ? (
                      <img
                        src="https://img.freepik.com/free-photo/blogging-gone-viral-camera-concept_53876-127618.jpg?ga=GA1.1.1194710755.1726822523&semt=ais_hybrid&w=740"
                        alt="Businessman using laptop in modern office"
                        className="w-full h-full object-cover"
                      />
                    ) : isSignUpPage ? (
                      <img
                        src="https://img.freepik.com/free-photo/man-is-using-laptop-books-notebook-top-view_169016-49211.jpg"
                        alt="Modern workspace setup with laptop and monitor"
                        className="w-full h-full object-cover"
                      />
                    ) : isForgotPassword ? (
                      <img
                        src="https://img.freepik.com/free-vector/forgot-password-concept-illustration_114360-1010.jpg?ga=GA1.1.1194710755.1726822523&semt=ais_hybrid&w=740"
                        alt="Security concept with lock"
                        className="w-full h-full object-cover"
                      />
                    ) : null
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <p>Loading image...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                {currentFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-[#1850F0] dark:text-blue-400" />
                    </div>
                    <div className="mb-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white ">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div
          className={`w-full md:w-1/2 flex flex-col justify-normal items-center lg:items-start p-4 md:p-6 lg:p-8 ${
            isSignUpPage
              ? "bg-white dark:bg-gray-900"
              : "bg-white dark:bg-gray-900"
          }`}
        >
          <div className="w-full max-w-xl lg:max-w-none lg:w-[520px] lg:ml-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
