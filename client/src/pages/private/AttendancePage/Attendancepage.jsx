import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../../../context/authContenxt";

const Attendancepage = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const classid = queryParams.get("id");
  const videoRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [presentStudent, setPresentStudents] = useState([]);

  useEffect(() => {
    console.log("Initializing connection with web socket...");

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
    });

    return () => {
      console.log("Cleaning up socket connection...");
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && isStreaming) {
      console.log("Setting up video_data Listener");

      socket.on("video_data", (data) => {
        // Ensure data.data is a base64 string
        if (data && data.data) {
          const byteCharacters = atob(data.data);
          const byteNumbers = new Uint8Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const blob = new Blob([byteNumbers], { type: "image/jpeg" });

          if (videoRef.current) {
            videoRef.current.src = URL.createObjectURL(blob);
            videoRef.current.onload = () => {
              URL.revokeObjectURL(videoRef.current.src); // Cleanup old object URL
            };
          }
        } else {
          console.error("Received data is not valid:", data);
        }
      });

      return () => {
        socket.off("video_data");
      };
    }
  }, [socket, isStreaming]);

  useEffect(() => {
    if (socket && isStreaming) {
      console.log("Setting up students_data Listener");

      socket.on("students_data", (data) => {
        console.log("Received data:", data);

        if (data && data.data) {
          try {
            const json_form = JSON.parse(data.data);
            console.log("Parsed JSON:", json_form);

            if (Array.isArray(json_form)) {
              setPresentStudents((prevData) => [...prevData, ...json_form]);
            } else {
              console.error("Parsed JSON is not an array:", json_form);
            }
          } catch (error) {
            console.error("Error parsing JSON data:", error);
          }
        } else {
          console.error("Received data is not valid:", data);
        }
      });

      return () => {
        socket.off("students_data");
      };
    }
  }, [socket, isStreaming]);

  const handleStart = () => {
    if (socket && socket.connected && classid) {
      console.log("Starting Stream...");
      const userID = currentUser.uid;

      socket.emit("start_stream", { classid, userID });
      setIsStreaming(true);
    } else {
      console.log("Socket not connected, cant start stream");
    }
  };

  const handleStop = () => {
    if (socket) {
      console.log("Stopping stream...");
      socket.emit("stop_stream");
      setIsStreaming(false);
      videoRef.current.src = null;
      setImageSrc(null);
    } else {
      console.log("Socket not available, cant stop stream");
    }
  };

  const handleCreateAttendance = () => {
    handleStop();
    socket.emit("save_attendance");
  };

  return (
    <div className="pt-32 h-screen w-full flex flex-col gap-5 px-10 items-center">
      <header className="w-full flex justify-center items-center">
        <h1 className="text-[32px] font-semibold text-green-950">
          Attendance Page
        </h1>
      </header>
      <div className="attendance-list-container w-full flex flex-row justify-between">
        <div className="display w-[640px] h-[480px] border-solid border-green-700 border-2 rounded-md">
          <img
            ref={videoRef}
            src={imageSrc}
            alt="Video Stream"
            className="w-full h-full"
          />
        </div>
        <div className="present-students w-[60%]  border-solid border-green-700 border-2 rounded-md px-10 py-5">
          <h3>Students Present Today</h3>
          <div className="flex flex-col gap-3 w-full">
            {presentStudent.length !== 0
              ? presentStudent.map((student, index) => (
                  <div
                    key={index}
                    className="flex flex-row p-5 shadow-md rounded-md gap-5"
                  >
                    <p>
                      {student.firstName} {student.lastName}
                    </p>
                    <p>
                      Status: <span className="text-green-700">Present</span>
                    </p>
                  </div>
                ))
              : "No Students attended yet"}
          </div>
        </div>
      </div>
      <div className="actions flex flex-row items-center w-full justify-around">
        <button
          className="px-10 py-3 rounded-md bg-green-600 text-white"
          onClick={handleStart}
        >
          Start Attendance Session
        </button>
        <button
          onClick={handleCreateAttendance}
          className="px-10 py-3 rounded-md bg-green-600 text-white"
        >
          Finish Attendance Session
        </button>
      </div>
    </div>
  );
};

export default Attendancepage;
