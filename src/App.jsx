import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import { Toaster } from "./components/ui/Toaster";
import RequiredAuth from "./components/RequiredAuth";
import RequireRole from "./components/RequireRole";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuthStore from "./stores/authStore";
import { authApi } from "./utils/api";
import NewTranscription from "./pages/newTrans/NewTranscription";
import Templates from "./pages/templates/Templates";
import TemplateDetails from "./pages/templates/TemplateDetails";
import NewTemplate from "./pages/templates/NewTemplate";
import StreamingDemo from "./pages/newTrans/StreamingDemo";

// Lazy load components
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));

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
              // {
              //   path: "transcriptions",
              //   element: (
              //     <Suspense fallback={<LoadingPage />}>
              //       <TranscriptionList />
              //     </Suspense>
              //   ),
              // },
              // {
              //   path: "transcription/:id",
              //   element: (
              //     <Suspense fallback={<LoadingPage />}>
              //       <TranscriptionDetail />
              //     </Suspense>
              //   ),
              // },
              // {
              //   path: "transcribe/create",
              //   element: (
              //     <Suspense fallback={<LoadingPage />}>
              //       <CreateTranscription />
              //     </Suspense>
              //   ),
              // },
              {
                path: "new-transcription",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <NewTranscription />
                  </Suspense>
                ),
              },
              {
                path: "templates",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <Templates />
                  </Suspense>
                ),
              },
              {
                path: "template/:id",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <TemplateDetails />
                  </Suspense>
                ),
              },
              {
                path: "create-template",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <NewTemplate />
                  </Suspense>
                ),
              },
              {
                path: "demo",
                element: (
                  <Suspense fallback={<LoadingPage />}>
                    <StreamingDemo />
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
  const { token, setAuth } = useAuthStore();

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const response = await authApi.getCurrentUser(storedToken);
          if (response.data) {
            setAuth(response.data.user, storedToken);
          }
        } catch (error) {
          console.error("Auth verification failed:", error);
          localStorage.removeItem("token");
        }
      }
    };

    verifyAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} basename="/admin" />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
