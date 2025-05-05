import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import { Toaster } from "./components/ui/Toaster";
import RequiredAuth from "./components/RequiredAuth";
import RequireRole from "./components/RequireRole";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Lazy load components
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const CreateBlog = lazy(() => import("./pages/blogs/CreateBlog"));
const BlogList = lazy(() => import("./pages/blogs/BlogList"));
const BlogDetail = lazy(() => import("./pages/blogs/BlogDetail"));
const UserProfile = lazy(() => import("./pages/profile/UserProfile"));
const UserList = lazy(() => import("./pages/admin/UserList"));
const UserDetails = lazy(() => import("./pages/admin/UserDetails"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));

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
            element: (
              <Suspense fallback={<LoadingPage />}>
                <Dashboard />
              </Suspense>
            ),
          },
          // User-only routes
          {
            element: <RequireRole allowedRoles={["user"]} />,
            children: [
              {
                path: "blogs",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <BlogList />
                  </Suspense>
                ),
              },
              {
                path: "blogs/:id",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <BlogDetail />
                  </Suspense>
                ),
              },
              {
                path: "blogs/create",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <CreateBlog />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={<LoadingPage />}>
                <UserProfile />
              </Suspense>
            ),
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
