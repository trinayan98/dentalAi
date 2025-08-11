import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import {
  Pen,
  LayoutDashboard,
  Mic,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Users,
  ScrollText,
  MessageSquare,
  Notebook,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { ThemeToggle } from "../components/ThemeToggle";
import logoDark from "/images/Apisdor-Logo-dark.png";
import logoLight from "/images/Apisdor-Logo-white.png";
import ChatBot from "../components/chatbot/ChatBot";
const navigation = {
  common: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  user: [
    { name: "Transcriptions", href: "/dashboard/transcriptions", icon: Mic },
    {
      name: "New Transcription",
      href: "/dashboard/transcribe/create",
      icon: PlusCircle,
    },
    {
      name: "New Note",
      href: "/dashboard/new-transcription",
      icon: Notebook,
    },
    { name: "Templates", href: "/dashboard/templates", icon: Notebook },
    { name: "Profile", href: "/dashboard/profile", icon: Users },
  ],
  admin: [
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "System Logs", href: "/dashboard/logs", icon: ScrollText },
  ],
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";
  const navItems = [
    ...navigation.common,
    ...(isAdmin ? navigation.admin : navigation.user),
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-30 h-full  lg:w-[210px] xl:w-[224px] bg-white dark:bg-gray-800 transform transition-transform duration-200 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-4 dark:border-gray-700 ">
            <Link to="/dashboard" className="flex items-center justify-center">
              <div className="flex items-center space-x-2">
                {/* Light mode logo */}
                <img
                  src={logoLight}
                  alt="Apisdor Logo"
                  className="h-8 md:h-10 w-auto block dark:hidden"
                />
                {/* Dark mode logo */}
                <img
                  src={logoDark}
                  alt="Apisdor Logo"
                  className="h-8 sm:h-10 md:h-12 w-auto hidden dark:block"
                />
              </div>
            </Link>
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-5 py-0 space-y-3 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  "text-xxs group flex items-center px-4 py-2 pt-3 pb-3 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.href
                    ? "bg-primary-500 text-white dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/30"
                )}
              >
                <item.icon
                  className={clsx(
                    "mr-2 flex-shrink-0 h-4 w-4",
                    location.pathname === item.href
                      ? "text-white dark:text-primary-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-[192px] lg:pl-[210px] xl:pl-[224px] flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/100 dark:bg-gray-800 backdrop-blur-sm dark:border-gray-700 h-20">
          <div className="px-4 sm:px-6 h-20 flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center">
              <button
                className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Right side - User menu */}
            <div className="relative flex flex-row">
              <ThemeToggle className="mr-10" />
              <button
                className="ml-5 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={
                      user?.avatar ||
                      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    }
                    alt="User avatar"
                  />
                  <span className="hidden md:flex ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {(user?.name && user.name.trim()) ||
                      user?.username ||
                      "Guest"}
                    {isAdmin && (
                      <span className="ml-1 text-xs text-primary-500">
                        (Admin)
                      </span>
                    )}
                  </span>
                  <ChevronDown className="hidden md:block ml-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 z-20 mt-2 w-36 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <Link
                        to="/dashboard/profile"
                        className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 py-6 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
      {/* <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-blue-500 text-black flex items-center justify-center shadow-lg animate-bounce hover:scale-110 transition-transform"
        >
          <MessageSquare className="h-6 w-6" />
        </button>

        <ChatBot showChatbot={showChatbot} setShowChatbot={setShowChatbot} />
      </div> */}
    </div>
  );
}
