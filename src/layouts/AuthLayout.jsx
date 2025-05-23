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
import logoDark from "/images/Apisdor-Logo-dark.png";
import logoLight from "/images/Apisdor-Logo-white.png";
// Import workspace image
const workspaceImg = new URL(
  "https://img.freepik.com/free-photo/man-is-using-laptop-books-notebook-top-view_169016-49211.jpg?ga=GA1.1.1194710755.1726822523&semt=ais_hybrid&w=740",
  import.meta.url
).href;

const signUpFeatures = [
  {
    title: "Accurate Medical Transcription",
    description: "Convert medical dictations to text with high accuracy",
    icon: Sparkles,
  },
  {
    title: "HIPAA Compliant",
    description: "Secure handling of sensitive medical information",
    icon: Shield,
  },
  {
    title: "EHR Integration",
    description: "Seamless integration with Electronic Health Records",
    icon: Zap,
  },
];

const authFeatures = [
  {
    title: "Secure Access",
    description: "HIPAA-compliant security for all medical data",
    icon: Shield,
  },
  {
    title: "Medical Templates",
    description: "Pre-built templates for various medical specialties",
    icon: BookOpen,
  },
  {
    title: "Quality Assurance",
    description: "Built-in quality checks for medical accuracy",
    icon: Check,
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
          {/* Light mode logo */}
          <img
            src={logoLight}
            alt="Apisdor Logo"
            className="h-8 sm:h-10 md:h-12 w-auto block dark:hidden"
          />
          {/* Dark mode logo */}
          <img
            src={logoDark}
            alt="Apisdor Logo"
            className="h-8 sm:h-10 md:h-12 w-auto hidden dark:block"
          />
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
              className="space-y-6"
            >
              <div className="space-y-1">
                <h1
                  className={`text-xl font-bold dark:text-blue-500 dark:text-blue-500 text-gray-800`}
                >
                  {isSignUpPage
                    ? "Create your medical transcription account"
                    : isForgotPassword
                    ? "Password Recovery"
                    : "Welcome to Medical Transcription"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isSignUpPage
                    ? "Join our platform and streamline your medical documentation process"
                    : isForgotPassword
                    ? "We'll help you regain access to your medical transcription account"
                    : "Sign in to access your medical transcription workspace"}
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
                        src="/signinTrans.svg"
                        alt="Businessman using laptop in modern office"
                        className="w-full h-full object-cover"
                      />
                    ) : isSignUpPage ? (
                      <img
                        src="/transLogin.svg"
                        alt="Modern workspace setup with laptop and monitor"
                        className="w-full h-full object-cover"
                      />
                    ) : isForgotPassword ? (
                      <img
                        src="/forgotPwdTrans.svg"
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
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-[#1850F0] dark:text-gray-400" />
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
