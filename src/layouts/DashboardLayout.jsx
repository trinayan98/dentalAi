import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import {
  Pen,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { ThemeToggle } from "../components/ThemeToggle";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
          "fixed top-0 left-0 z-30 h-full w-56 bg-white dark:bg-gray-800  transform transition-transform duration-200 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4  dark:border-gray-700">
            <Link to="/dashboard" className="flex items-center">
              <Pen className="h-5 w-5 text-primary-500" />
              <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-white">
                Logo
              </span>
            </Link>
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-5 py-0 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "text-xs group flex items-center px-4 py-2 pt-3 pb-3 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.path
                    ? " bg-primary-500 text-white dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/30"
                )}
              >
                <item.icon
                  className={clsx(
                    "mr-2 flex-shrink-0 h-4 w-4",
                    location.pathname === item.path
                      ? "text-white dark:text-primary-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={clsx("md:pl-56 flex flex-col min-h-screen transition-all")}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/100 dark:bg-gray-800/80 backdrop-blur-sm   dark:border-gray-700">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center">
              <button
                className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              {/* <h1 className="ml-4 md:ml-0 text-xl font-semibold text-gray-900 dark:text-white">
                {getPageTitle(location.pathname)}
              </h1> */}
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
                    {user?.name || "User Name"}
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
        <main className="flex-1 py-6 px-4 sm:px-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Blogs",
    path: "/dashboard/blogs",
    icon: FileText,
  },
  {
    label: "Create Blog",
    path: "/dashboard/blogs/create",
    icon: PlusCircle,
  },
  {
    label: "Profile",
    path: "/dashboard/profile",
    icon: Settings,
  },
];

function getPageTitle(pathname) {
  switch (true) {
    case pathname === "/dashboard":
      return "Dashboard";
    case pathname === "/dashboard/blogs":
      return "My Blogs";
    case pathname === "/dashboard/blogs/create":
      return "Create Blog";
    case pathname.startsWith("/dashboard/blogs/"):
      return "Blog Details";
    case pathname === "/dashboard/profile":
      return "Profile Settings";
    default:
      return "Dashboard";
  }
}
