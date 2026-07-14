import { Outlet, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar/Navbar";
import { useAuth } from "../context/authContext";

export const Layout = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/private/dashboard" replace />;
  }

  return (
    <div className="flex flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
};
