import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";

const attendanceContext = createContext();

export function useAttendance() {
  return useContext(attendanceContext);
}

export const AttendanceProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const initializeSocket = useCallback(() => {
    console.log("Initializing connection with WebSocket...");

    const socketURL =
      window.location.hostname === "localhost" ? "http://127.0.0.1:5000" : "";

    const newSocket = io(socketURL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setSocket(newSocket);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setSocket(null);
    });

    return newSocket;
  }, []);

  useEffect(() => {
    const socketInstance = initializeSocket();

    return () => {
      console.log("Cleaning up socket connection...");
      socketInstance.disconnect();
    };
  }, [initializeSocket]);

  useEffect(() => {
    if (!socket) {
      console.warn("Socket was undefined, reinitializing...");
      initializeSocket();
    }
  }, [socket, initializeSocket]);

  const value = {
    socket,
  };

  return (
    <attendanceContext.Provider value={value}>
      {children}
    </attendanceContext.Provider>
  );
};
