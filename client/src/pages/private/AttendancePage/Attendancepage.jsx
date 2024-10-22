import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../../../context/authContenxt";
import { useDB } from "../../../context/DBContext";

const Attendancepage = () => {
  const db = useDB();
  const { currentUser } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const classid = queryParams.get("id");
  const videoRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [presentStudent, setPresentStudents] = useState([]);
  const attendanceSessionRef = useRef();

  useEffect(() => {
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

      const handleStudentData = (data) => {
        console.log("Received data:", data);

        if (data && data.data) {
          try {
            const json_form = JSON.parse(data.data);
            console.log("Parsed JSON:", json_form);

            if (json_form) {
              setPresentStudents((prevData) => {
                const isPresent = prevData.some(
                  (student) => student.id === json_form.id
                );

                if (isPresent) {
                  return prevData;
                }

                return [...prevData, json_form];
              });
            }
          } catch (error) {
            console.error("Error parsing JSON data:", error);
          }
        } else {
          console.error("Received data is not valid or empty:", data);
          console.log("Requesting backend to emit data again...");
          socket.emit("request_students_data", { classid });
        }
      };

      socket.on("students_data", handleStudentData);
      return () => {
        socket.off("students_data", handleStudentData);
      };
    }
  }, [socket, isStreaming, classid]);

  useEffect(() => {
    if (currentUser && socket && socket.connected && classid) {
      const userID = currentUser.uid;
      socket.emit("load_student_data", userID, classid);
      socket.emit("load_images");
    }
  }, [socket, classid, currentUser]);

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

  const handleCreateAttendance = async () => {
    try {
      if (currentUser) {
        if (presentStudent.length !== 0) {
          const attendanceSession = attendanceSessionRef.current.value;
          if (attendanceSession) {
            await db.RecordAttendance(
              classid,
              attendanceSession,
              presentStudent
            );
          }
        }
      }
    } catch (error) {
    } finally {
      handleStop();
    }
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
          <div className="input-group flex flex-col [&_input]:border-green-600 [&_input]:border-solid [&_input]:border-[1px] [&_input]:">
            <label htmlFor="attendance-session">Attendance Session Name</label>
            <input
              type="text"
              id="attendance-session"
              ref={attendanceSessionRef}
              required
            />
          </div>
          <div className="flex flex-col gap-3 w-full">
            {presentStudent.length !== 0
              ? presentStudent.map((student, index) => (
                  <div
                    key={index}
                    className="flex flex-row justify-between w-full p-5 shadow-md rounded-md gap-5"
                  >
                    <p>
                      {student.firstName} {student.lastName}
                    </p>
                    <p>
                      Status: <span className="text-green-700">Present</span>
                    </p>
                   <div className="wrapper h-[80px] w-[80px]">
                   <img src={student.studentImage} alt="Student Photo" className="object-center object-fill h-full w-full" />
                   </div>
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
