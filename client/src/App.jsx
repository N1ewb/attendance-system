import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Layout } from "./layouts/Layout";
import LandingPage from "./pages/Landing/LandingPage";
import { AuthLayout } from "./layouts/AuthLayout";
import Login from "./pages/Auth/Login";
import PrivateLayout from "./layouts/PrivateLayout";
import Dashboard from "./pages/private/dashboard/Dashboard";
import { AuthProvider } from "./context/authContext";
import Class from "./pages/private/class/Class";
import { ClassDetail } from "./pages/private/classDetail/ClassDetail";
import Attendancepage from "./pages/private/AttendancePage/Attendancepage";
import Signup from "./pages/Auth/Signup";
import { DBProvider } from "./context/DBContext";
import { ModalProvider } from "./context/ModalContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/auth",
        element: <AuthLayout />,
        children: [
          {
            path: "/auth/Login",
            element: <Login />,
          },
          {
            path: "/auth/Signup",
            element: <Signup />,
          },
        ],
      },
      {
        path: "/private",
        element: <PrivateLayout />,
        children: [
          {
            path: "/private/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/private/class",
            element: <Class />,
          },
          {
            path: "/private/class/:subjectCode",
            element: <ClassDetail />,
          },
          {
            path: "/private/attendance",
            element: <Attendancepage />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <DBProvider>
        <ModalProvider>
          <Toaster position="top-right" />
          <RouterProvider router={router} />
        </ModalProvider>
      </DBProvider>
    </AuthProvider>
  );
}

export default App;
