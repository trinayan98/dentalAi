import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const RequiredAuth = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  return isAuthenticated ? (
    <>
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequiredAuth;
