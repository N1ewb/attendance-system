import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../../context/authContext";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const Attendancepage = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const classId = queryParams.get("id");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const socketRef = useRef(null);
  const sessionIdRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [presentStudents, setPresentStudents] = useState([]);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch {
      toast.error("Camera access denied. Please allow camera permissions.");
      return false;
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureAndSendFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const socket = socketRef.current;
    if (!video || !canvas || !socket || !socket.connected) return;

    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 320, 240);
    const dataUri = canvas.toDataURL("image/jpeg", 0.5);
    socket.emit("frame", { data: dataUri });
  }, []);

  useEffect(() => {
    const socketUrl = API_URL;
    const socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setConnecting(false);
      setConnectionFailed(false);
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      if (reason !== "io client disconnect") {
        setConnecting(true);
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connect_error:", err.message);
    });

    socket.on("reconnect_attempt", () => {
      setConnecting(true);
    });

    socket.on("reconnect_failed", () => {
      setConnecting(false);
      setConnectionFailed(true);
      toast.error(`Could not connect to server at ${socketUrl}. Make sure the server is running.`);
    });

    socket.on("stream_started", (data) => {
      sessionIdRef.current = data.session_id;
      if (data.encodings_loaded === 0) {
        toast("No students with face encodings found. Detection may not work.");
      }
    });

    socket.on("stream_error", (data) => {
      setStreaming(false);
      stopWebcam();
      toast.error(data.message || "Stream failed to start.");
    });

    socket.on("stream_stopped", () => {
      setStreaming(false);
    });

    socket.on("student_detected", (data) => {
      setPresentStudents((prev) => {
        if (prev.some((s) => s.student_id === data.student_id)) return prev;
        const student = {
          student_id: data.student_id,
          first_name: data.first_name,
          last_name: data.last_name,
          timestamp: data.timestamp,
        };
        toast.success(`${data.first_name} ${data.last_name} detected and marked present.`);
        return [...prev, student];
      });
    });

    return () => {
      stopWebcam();
      if (socket.connected) {
        socket.emit("stop_stream");
      }
      socket.disconnect();
    };
  }, [stopWebcam]);

  const handleStart = async () => {
    if (!socketRef.current?.connected) {
      toast.error("Not connected to server.");
      return;
    }
    if (!classId) {
      toast.error("No class selected.");
      return;
    }
    if (!currentUser) {
      toast.error("You must be logged in.");
      return;
    }

    const webcamOk = await startWebcam();
    if (!webcamOk) return;

    const { data: session, error: sessionError } = await supabase
      .from("attendance_sessions")
      .insert({
        class_id: classId,
        session_name: `Live Session - ${new Date().toLocaleDateString()}`,
      })
      .select()
      .single();

    if (sessionError || !session) {
      toast.error("Failed to create attendance session: " + (sessionError?.message || "Unknown error"));
      stopWebcam();
      return;
    }

    sessionIdRef.current = session.id;
    setStreaming(true);

    supabase.auth.getSession().then(({ data: { session: authSession } }) => {
      socketRef.current?.emit("start_stream", {
        class_id: classId,
        user_id: currentUser.id,
        session_id: session.id,
        access_token: authSession?.access_token || "",
      });
    });

    toast.success("Attendance session started.");
    frameIntervalRef.current = setInterval(captureAndSendFrame, 200);
  };

  const handleStop = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("stop_stream");
    }
    stopWebcam();
    setStreaming(false);
  };

  const handleCancel = () => {
    handleStop();

    const sessionId = sessionIdRef.current;
    if (sessionId) {
      supabase.from("attendance_sessions").delete().eq("id", sessionId).then();
    }

    sessionIdRef.current = null;
    setPresentStudents([]);
    toast("Attendance session cancelled.");
    navigate(`/private/class?id=${classId}`);
  };

  const handleFinish = async () => {
    handleStop();

    const sessionId = sessionIdRef.current;
    if (!sessionId || presentStudents.length === 0) {
      toast.error("No students to record.");
      navigate(`/private/class?id=${classId}`);
      return;
    }

    try {
      for (const student of presentStudents) {
        const { error: insertError } = await supabase
          .from("attendance_records")
          .insert({
            session_id: sessionId,
            student_id: student.student_id,
          });
        if (!insertError) {
          await supabase.rpc("increment_attendance", {
            p_student_id: student.student_id,
          });
        }
      }

      toast.success(`Attendance recorded for ${presentStudents.length} students.`);
    } catch {
      toast.error("Failed to record attendance.");
    }

    navigate(`/private/class?id=${classId}`);
  };

  if (connecting) {
    return (
      <div className="h-screen w-full pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700" />
      </div>
    );
  }

  if (connectionFailed) {
    return (
      <div className="h-screen w-full pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">Could not connect to server at {API_URL}.</p>
        <p className="text-gray-500 text-sm">Make sure the Python server is running.</p>
        <button
          className="px-6 py-2 bg-green-700 text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 h-screen w-full flex flex-col gap-5 px-10 items-center">
      <header className="w-full flex justify-center items-center gap-4">
        <h1 className="text-[32px] font-semibold text-green-950">
          Attendance Page
        </h1>
        {streaming && (
          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium border border-green-300">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            Session Active
          </div>
        )}
      </header>

      <div className="attendance-list-container w-full flex flex-row justify-between">
        <div className="relative w-[640px] h-[480px] border-solid border-green-700 border-2 rounded-md overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {streaming && (
            <>
              <div className="absolute top-2 right-2 flex items-center gap-2 bg-green-700 text-white px-3 py-1 rounded-full text-sm z-10">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br" />
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="present-students w-[60%] border-solid border-green-700 border-2 rounded-md px-10 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Present Students</h2>
            {streaming && (
              <span className="text-sm text-gray-500">
                {presentStudents.length} detected
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 w-full max-h-[400px] overflow-auto">
            {presentStudents.length > 0 ? (
              presentStudents.map((student) => (
                <div
                  key={student.student_id}
                  className="flex flex-row justify-between w-full p-5 shadow-md rounded-md gap-5 items-center"
                >
                  <p className="font-medium">
                    {student.first_name} {student.last_name}
                  </p>
                  <p>
                    Status: <span className="text-green-700 font-semibold">Present</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(student.timestamp * 1000).toLocaleTimeString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-10">
                {streaming ? "No students detected yet." : "Start a session to begin."}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="actions flex flex-row items-center w-full justify-center gap-4">
        {!streaming ? (
          <button
            className="px-10 py-3 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleStart}
            disabled={!connected}
          >
            {connected ? "Start Attendance Session" : "Connecting..."}
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handleFinish}
              className="px-10 py-3 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              {presentStudents.length > 0
                ? `Finish (${presentStudents.length} recorded)`
                : "Finish (no students)"}
            </button>
            <button
              onClick={handleCancel}
              className="px-10 py-3 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Cancel Session
            </button>
          </div>
        )}
        <button
          onClick={() => navigate(`/private/class?id=${classId}`)}
          className="px-10 py-3 rounded-md bg-gray-600 text-white hover:bg-gray-700"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Attendancepage;
