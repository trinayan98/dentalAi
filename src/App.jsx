import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateBlog from "./pages/blogs/CreateBlog";
import BlogList from "./pages/blogs/BlogList";
import BlogDetail from "./pages/blogs/BlogDetail";
import UserProfile from "./pages/profile/UserProfile";
import UserDetails from "./pages/admin/UserDetails";
import { Toaster } from "./components/ui/Toaster";
import RequiredAuth from "./components/RequiredAuth";
import RequireRole from "./components/RequireRole";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import UserList from "./pages/admin/UserList";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLogs from "./pages/admin/AdminLogs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Loading component
const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "signup",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <SignUp />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: "reset-password",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <ResetPassword />
          </Suspense>
        ),
      },
      {
        path: "verify-email",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <VerifyEmail />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/dashboard",
    element: <RequiredAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "",
            element: <Dashboard />,
          },
          // User-only routes
          {
            element: <RequireRole allowedRoles={["user"]} />,
            children: [
              {
                path: "blogs",
                element: <BlogList />,
              },
              {
                path: "blogs/:id",
                element: <BlogDetail />,
              },
              {
                path: "blogs/create",
                element: <CreateBlog />,
              },
            ],
          },
          {
            path: "profile",
            element: <UserProfile />,
          },
          // Admin-only routes
          {
            element: <RequireRole allowedRoles={["admin"]} />,
            children: [
              {
                path: "users",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <UserList />
                  </Suspense>
                ),
              },
              {
                path: "users/:id",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <UserDetails />
                  </Suspense>
                ),
              },
              {
                path: "settings",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <AdminSettings />
                  </Suspense>
                ),
              },
              {
                path: "logs",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <AdminLogs />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} basename="/admin" />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
